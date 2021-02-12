import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const getHttpErrorMsg = (): string[] => {
      // Only process Http Exceptions
      if (!(exception instanceof HttpException)) return;

      const errorResponse = exception.getResponse();
      // if http error response is a string, return an array or error message string
      // else if, its an object, check that the message property is an Array
      // and if so, return the message property otherwise return an Array of the message
      if (typeof errorResponse === 'string') {
        return [errorResponse];
      } else if (typeof errorResponse === 'object') {
        let msg = errorResponse as Error;
        return Array.isArray(msg.message) ? msg.message : [msg.message];
      }
    };

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const messageBody =
      exception instanceof HttpException ? getHttpErrorMsg() : ['Internal Server Error'];

    response.status(status).json({
      statusCode: status,
      message: messageBody,
    });
  }
}
