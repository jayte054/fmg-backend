import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateException extends HttpException {
  constructor(
    message: string = 'data already exits',
    options?: Record<string, any>,
  ) {
    super(
      {
        response: 'data already exists',
        message,
        status: HttpStatus.CONFLICT,
        name: 'DuplicateException',
        options,
      },
      HttpStatus.CONFLICT,
    );
  }
}
