import { IsString, IsEmail, MinLength } from 'class-validator'
export class UserDto {
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