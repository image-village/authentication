import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { UserPayload } from './users.interface';
import { User } from './users.entity';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

const scryptAsync = promisify(scrypt);
@Injectable()
export class Utils {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Hash input password
   * @param password  
   */
  public async passwordHash(password: string): Promise<string> {
    return this.stringHasher(password);
  }

  /**
   * Checks the input password is equal to the saved password
   * @param storedPassword existing password
   * @param suppliedPassword client provided password
   */
  public async comparePassword(
    storedPassword: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    return this.stringComparer(storedPassword, suppliedPassword);
  }

  /**
   * Creates a created Json Web Token
   * @param user user credentials
   */
  public jwt(user: User): string {
    return this.createJwt(user);
  }

  /**
   * Verifies that the input json web token is valid
   * @param sessionJwt json web token
   */
  public verifyJwt(sessionJwt: string): string | object {
    return this.jwtVerifier(sessionJwt);
  }

  /**
   * Serialize User object
   * @param user User Object
   */
  static toJSON(user: User): string {
    const response: UserPayload = { id: user.id, email: user.email };
    return JSON.stringify(response);
  }

  private async stringHasher(context: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buffer = (await scryptAsync(context, salt, 64)) as Buffer;
    return `${buffer.toString('hex')}.${salt}`;
  }

  private async stringComparer(
    baseString: string,
    suppliedString: string,
  ): Promise<boolean> {
    const [hashedString, salt] = baseString.split('.');
    const buffer = (await scryptAsync(suppliedString, salt, 64)) as Buffer;
    return buffer.toString('hex') === hashedString;
  }

  private getJwtKey(): string {
    return this.configService.get<string>('JWT_KEY');
  }

  private jwtVerifier(jwtString: string) {
    const JWT_KEY = this.getJwtKey();
    return jwt.verify(jwtString, JWT_KEY);
  }

  private createJwt(user: User) {
    const JWT_KEY = this.getJwtKey();
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_KEY,
    );
  }
}
