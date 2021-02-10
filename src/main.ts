import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Transport, MicroserviceOptions } from '@nestjs/microservices'; // TODO
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './app.exceptions';
import cookieSession from 'cookie-session';

async function bootstrap() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.use(cookieSession({ signed: false, secure: true }));
  app.set("trust proxy", true)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());


  app.listen(port, () =>
    console.log(`Connected to MongoDB 
Auth Service is listening on port ${port}`),
  );
}
bootstrap();
