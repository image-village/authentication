import {
  Entity,
  Column,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';
import { Utils } from './users.utils';


@Entity()
@Unique(['email'])
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @IsEmail({}, { message: 'Invalid email' })
  @Column({ nullable: false })
  email: string;

  @MinLength(6, { message: 'Password needs to be at least 6 characters' })
  @Column({ nullable: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    this.password = await Utils.passwordHash(this.password);
  }
}
