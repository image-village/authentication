import {
  Controller,
  Get,
  Post,
  Body,
  Header,
  ValidationPipe,
} from '@nestjs/common';
import { User } from './users.dto'
// import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service'

@Controller('/users')
export class UsersController {
  constructor() {}
  //   constructor(private readonly usersService: UsersService) {}

  @Get('/currentuser')
  currentUser(): string {
    return 'Hi there Current user';
  }
  @Post('/signin')
  signIn(): string {
    return 'Hi there user signin';
  }
  @Post('/signout')
  signOut(): string {
    return 'Hi there user signout';
  }

  @Post('/signup')
  // @Header('content-type', 'application/json')
  public signUp(@Body() user: User): string {
    console.log(user);
    return 'Hi there user signup';
  }
}

