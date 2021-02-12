import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'
import { Utils } from './users.utils'
import { User } from './users.entity';
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  exports: [TypeOrmModule],
  controllers: [UsersController],
  providers: [UsersService, Utils],
})
export class UsersModule {}
