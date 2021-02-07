import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices'; // TODO
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './app.exceptions';

async function bootstrap() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
   app.useGlobalFilters(new AllExceptionsFilter());
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       host: '0.0.0.0',
  //       port,
  //     }
  //   },
  // );

  app.listen(port, () =>
    console.log('Auth Service is listening on port', port),
  );
}
bootstrap();
