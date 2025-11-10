// import { WorkerHost } from '@nestjs/bullmq';
import { PaymentService } from './payment.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentProcessor {
  constructor(private readonly paymentService: PaymentService) {}

  createFincraVirtualAccount = () => {};

  buyerWalletCheckoutPayment = () => {};

  driverWalletWithdrawal = () => {};
}
