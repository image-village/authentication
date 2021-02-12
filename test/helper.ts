import { INestApplication } from '@nestjs/common';
import request from 'supertest';

/**
 * Signup function helper for testing purposes
 */
export async function signup(app: INestApplication) {
  const email = 'test@test.com';
  const password = 'password123';

  const response = await request(app.getHttpServer()) 
    .post('/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');
  return cookie;
}
