import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { User } from './users.entity';
import { Utils } from './users.utils';
import { EMAIL_ALREADY_IN_USE, INVALID_CREDENTIALS } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private utils: Utils
  ) {}

  async createUser(user: User): Promise<User> {
    const { email } = user;
    const existingUser = await this.usersRepository.findOne({
      email,
    });

    if (existingUser) {
      throw new ConflictException(EMAIL_ALREADY_IN_USE);
    }
    const newUser = await this.usersRepository.save(user);

    return newUser;
  }

  async findUser(user: User): Promise<User> {
    const { email, password } = user;

    const existingUser = await this.usersRepository.findOne({
      email,
    });

    if (!existingUser) {
      throw new BadRequestException(INVALID_CREDENTIALS);
    }

    const passwordIsValid = await this.utils.comparePassword(
      existingUser.password,
      password,
    );

    if (!passwordIsValid) {
      throw new BadRequestException(INVALID_CREDENTIALS);
    }

    return existingUser;
  }
}
