import { IsString, IsEmail, Length, MinLength } from 'class-validator'
export class User {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password is too short',
  })
  password: string;
}