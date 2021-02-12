import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

const MongoDbModule = TypeOrmModule.forRoot({
  type: 'mongodb',
  host: 'auth-mongo-srv',
  logging: true,
  port: 27017,
  database: 'auth-mongo',
  password: 'root',
  autoLoadEntities: true,
  synchronize: false,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

@Module({
  imports: [
    MongoDbModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
