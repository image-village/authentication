import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'auth-mongo-srv',
      logging: true,
      port: 27017,
      database: 'auth-mongo',
      password: 'root',
      autoLoadEntities: true,
      synchronize: true, // ! REMOVE IN PROD
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
