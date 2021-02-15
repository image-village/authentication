import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ErrorObject {
  message: string;
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const errors: ErrorObject[] = [];
    let statusCode = 0;

    const errorProcessor = () => {
      /**
       * * Handle server errors
       */
      if (!(exception instanceof HttpException)) {
        (statusCode = HttpStatus.INTERNAL_SERVER_ERROR),
          errors.push({
            message: 'Internal Server Error',
          });
        return;
      }

      statusCode = exception.getStatus();
      /**
       * * Handle generic errors
       */
      if (statusCode === 404) {
        errors.push({
          message: 'Not Found',
        });
        return;
      } else if (statusCode === 401) {
        errors.push({
          message: 'Unauthorized',
        });
        return;
      }
      /**
       * * Handle application context errors
       */
      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'string') {
        errors.push({
          message: errorResponse,
        });
      } else if (typeof errorResponse === 'object') {
        let msg = errorResponse as ErrorObject;
        if (Array.isArray(msg.message)) {
          for (let err of msg.message) {
            errors.push({
              message: err,
            });
          }
        }
      }
    };

    errorProcessor();

    response.status(statusCode).json({ errors });
  }
}
