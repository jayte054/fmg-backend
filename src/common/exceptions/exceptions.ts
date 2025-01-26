import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateException extends HttpException {
  constructor(message: string = 'data already exits') {
    super(message, HttpStatus.CONFLICT);
  }
}
