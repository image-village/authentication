import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { User } from '../src/users/users.entity';
import { AllExceptionsFilter } from '../src/app.exceptions';
import cookieSession from 'cookie-session';
import { signup } from './helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    // connect to mock mongo DB
    mongo = await MongoMemoryServer.create();

    const url = await mongo.getUri('auth-test-db');

    // Create dynamic module that connects TypeOrm to the mock DB
    const DbModule = TypeOrmModule.forRoot({
      name: 'test-connection',
      type: 'mongodb',
      host: '127.0.0.1',
      url,
      entities: [__dirname + `/../src/users/users.entity.ts`],
      // entities: [User],
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        DbModule,
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.use(cookieSession({ signed: false, secure: false }));
    await app.init();
  });

  afterAll(async () => {
    // Clean by after tests by closing app and db connection
    try {
      await mongo.stop();
      await app.close();
    } catch (error) {
      console.error(error.message);
    }
  });

  describe('UsersModule, ', () => {
    // script to remove all database entries for users between tests
    beforeEach(async () => {
      await getConnection().synchronize(true);
    });

    describe('User signup scenarios, @Post(/users/signup)', () => {
      it('should return status 201 on successful signup', async () => {
        const user = new User();
        user.email = 'test@test.com';
        user.password = 'password';

        return await request(app.getHttpServer())
          .post('/users/signup')
          .send(user)
          .expect(201);
      });

      it('should throw an error for an invalid email', async () => {
        return await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@test',
            password: 'password',
          })
          .expect(400)
          .expect({
            errors: [{ message: 'Invalid email' }],
          });
      });

      it('should throw an error for an invalid password', async () => {
        return await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@test.ca',
            password: 'pa',
          })
          .expect(400)
          .expect({
            errors: [{ message: 'Password needs to be at least 6 characters' }],
          });
      });

      it('should throw an error for missing email and/or password', async () => {
        return await request(app.getHttpServer())
          .post('/users/signup')
          .send({})
          .expect(400)
          .expect({
            errors: [
              { message: 'Invalid email' },
              { message: 'Password needs to be at least 6 characters' },
            ],
          });
      });

      it('should prevent signing up with duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@test.com',
            password: 'password',
          })
          .expect(201);
        await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@test.com',
            password: 'password',
          })
          .expect(409)
          .expect({ errors: [{ message: 'Email already in use' }] });
      });

      it('should set a cookie after successful signup', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@test.com',
            password: 'password',
          })
          .expect(201);

        expect(response.get('Set-Cookie')).toBeDefined();
      });
    });

    describe('User signin scenarios, @Post(/users/signin)', () => {
      it('should return status 200 on succsessful siginin and cookie is set', async () => {
        await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test123@test.com',
            password: 'password',
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test123@test.com',
            password: 'password',
          })
          .expect(200);

        expect(response.get('Set-Cookie')).toBeDefined();
      });

      it('should throw an error when signing in with an invalid email', async () => {
        return await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test123@test.com',
            password: 'password',
          })
          .expect(400)
          .expect({ errors: [{ message: 'Invalid credentials' }] });
      });

      it('should throw an error when signing with the wrong password', async () => {
        await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test123@test.com',
            password: 'password',
          })
          .expect(201);

        await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test123@test.com',
            password: 'password12345',
          })
          .expect(400)
          .expect({ errors: [{ message: 'Invalid credentials' }] });
      });
    });

    describe('User signout scenarios, @Post(/users/signout)', () => {
      it('should return status 200 on successful signout and cookie set to the past', async () => {
        await signup(app);

        const response = await request(app.getHttpServer())
          .post('/users/signout')
          .send({})
          .expect(200);

        expect(response.get('Set-Cookie')[0]).toEqual(
          'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
        );
      });
    });

    describe('Current User scenarios, @Get(/users/currentuser)', () => {
      it('should return details of authenticated user', async () => {
        const cookie = await signup(app);

        const response = await request(app.getHttpServer())
          .get('/users/currentuser')
          .set('Cookie', cookie)
          .send()
          .expect(200);

        expect(response.body.currentUser.email).toEqual('test@test.com');
      });

      it('should return null if current user is not authenticated', async () => {
        await request(app.getHttpServer())
          .get('/users/currentuser')
          .send()
          .expect({
            currentUser: null,
          })
          
      });
    });
  });
});
