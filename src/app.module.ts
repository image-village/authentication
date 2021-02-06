import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AppController, UsersController],
})
export class AppModule {}
