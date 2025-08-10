import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: AuditLogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    //handle HttpException (built-in for custom)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as any).message ?? 'An error occured');

      //   errorResponse =
      //     typeof exceptionResponse === 'string'
      //       ? {
      //           statusCode: status,
      //           message: exceptionResponse,
      //           timestamp: new Date().toISOString(),
      //           path: request.url,
      //         }
      //       : {
      //           statusCode: status,
      //           ...exceptionResponse,
      //           timestamp: new Date().toISOString(),
      //           path: request.url,
      //         };
      // handle non-HttpException errors
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        exception instanceof Error
          ? exception.message
          : typeof exception === 'string'
            ? exception
            : 'Internal server error';
      //   errorResponse = {
      //     statusCode: status,
      //     message: 'Internal server error',
      //     timestamp: new Date().toISOString(),
      //     path: request.url,
      //   };
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.loggerService.log({
      logCategory:
        exception instanceof HttpException
          ? LogCategory.HttpException
          : LogCategory.ExceptionFilter,
      description: errorResponse.message,
      details: {
        path: request.url,
        method: request.method,
        body: (() => {
          try {
            return JSON.stringify(request.body);
          } catch {
            return '[Unable to serialize request body]';
          }
        })(),
      },
    });

    response.status(status).json(errorResponse);
  }
}
