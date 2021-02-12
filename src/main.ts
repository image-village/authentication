import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './app.exceptions';
import cookieSession from 'cookie-session';
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.enableCors();
  app.use(cookieSession({ signed: false, secure: false }));
  app.set('trust proxy', true);
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
