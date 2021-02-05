import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service'

@Controller('/users')
export class UsersController {
  constructor() {}
  //   constructor(private readonly usersService: UsersService) {}

  @Get('/currentuser')
  currentUser(): string {
    return 'Hi there Current user';
  }
  @Get('/signin')
  signIn(): string {
    return 'Hi there user signin';
  }
  @Get('/signout')
  signOut(): string {
    return 'Hi there user signout';
  }
  @Get('/signup')
  signUp(): string {
    return 'Hi there user signup';
  }

  


}

