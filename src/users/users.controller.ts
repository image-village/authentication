import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Utils } from './users.utils';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { AuthGuard } from './users.guard';
import {
  EMAIL_ALREADY_IN_USE,
  USER_NOT_CREATED,
  INVALID_CREDENTIALS,
} from './users.interface';
import { ObjectID } from 'typeorm';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private utils: Utils,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/currentuser')
  currentUser(@Res() res: Response, @Req() req: Request) {
    res.send({ currentUser: req.currentUser });
  }

  @Post('/signout')
  signOut(@Res() res: Response, @Req() req: Request) {
    req.session = null;
    res.status(HttpStatus.OK).send({});
  }

  @Post('/signin')
  async signIn(@Res() res: Response, @Req() req: Request, @Body() user: User) {
    try {
      const currentUser = await this.usersService.findUser(user);
      const userJwt = this.utils.jwt(currentUser);
      const jsonPayload = Utils.toJSON(currentUser);

      // store jwt on session object
      req.session = {
        jwt: userJwt,
      };

      res.status(HttpStatus.OK).send(jsonPayload);
    } catch (error) {
      if (error.message === INVALID_CREDENTIALS) {
        throw new HttpException(error.message, error.status);
      } else {
        throw new Error(error.message);
      }
    }
  }

  @Post('/signup')
  async signUp(
    @Res() res: Response,
    @Req() req: Request,
    @Body() userDTO: User,
  ) {
    let user: User;
    try {
      const hashedPassword = await this.utils.passwordHash(userDTO.password);
      const modifiedUser: User = {
        ...userDTO,
        password: hashedPassword,
      };
      user = await this.usersService.createUser(modifiedUser);
      const jsonPayload = Utils.toJSON(user);
      const userJwt = this.utils.jwt(user);
 
      // store jwt on session object
      req.session = {
        jwt: userJwt,
      };

      return res.status(HttpStatus.CREATED).send(jsonPayload);
    } catch (error) {
      if (error.message === EMAIL_ALREADY_IN_USE) {
        throw new HttpException(EMAIL_ALREADY_IN_USE, HttpStatus.CONFLICT);
      } else if (!user) {
        throw new HttpException(USER_NOT_CREATED, HttpStatus.BAD_REQUEST);
      } else {
        throw new Error();
      }
    }
  }

}
