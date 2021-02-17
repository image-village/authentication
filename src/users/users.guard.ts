import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from './users.interface';
import { Utils } from './users.utils';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private utils: Utils){}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as Request;
    const authorization = request.session?.jwt;

    if (!authorization) {
      request.currentUser = null;
      return true;
    }

    try {
      const payload = this.utils.verifyJwt(authorization) as UserPayload;
      request.currentUser = payload;
      return true;
    } catch (error) {}

    throw new UnauthorizedException();
  }
}
