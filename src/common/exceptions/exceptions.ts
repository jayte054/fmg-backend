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

export class PaymentVerification extends HttpException {
  constructor(
    message: string = 'payment verification failed',
    options?: Record<string, unknown>,
  ) {
    super(
      {
        response: 'payment verification unsuccessful',
        message,
        status: HttpStatus.PAYMENT_REQUIRED,
        name: 'PaymentVerification',
        options,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
