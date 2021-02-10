import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { UserPayload } from './users.interface';
import { User } from './users.entity'
import jwt from 'jsonwebtoken';

const scryptAsync = promisify(scrypt);

export class Utils {
  // Method to hash password
  static async passwordHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buffer.toString('hex')}.${salt}`;
  }

  // Method to compare passwords
  static async comparePassword(
    storedPassword: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buffer.toString('hex') === hashedPassword;
  }

  static jwt(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY || 'process.env.JWT_KEY', // ! REMOVE IN PROD
    );
  }

  static verifyJwt(sessionJwt: string) {
    return jwt.verify(sessionJwt, process.env.JWT_KEY || 'process.env.JWT_KEY'); // ! REMOVE IN PROD
  }

  static toJSON(user: User): string {
    const response: UserPayload = { id: user.id, email: user.email };
    return JSON.stringify(response);
  }
}
