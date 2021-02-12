import { ObjectID } from 'typeorm';
import { User } from './users.entity'

export const EMAIL_ALREADY_IN_USE = "Email already in use"
export const USER_NOT_CREATED = "User not created!"
export const INVALID_CREDENTIALS = "Invalid credentials"

export type UserPayload = { id: ObjectID; email: string };

export interface AppRequest extends Request {
  user?: User;
}
