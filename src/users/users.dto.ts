import { IsString, IsEmail, MinLength } from 'class-validator'
export class User {
  @IsEmail({}, {
    message: "Invalid email"
  })
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password needs to be at least 6 characters',
  })
  password: string;
}