import { PaymentEntity } from '../entity/payment.entity';
import { PaymentFilter, PaginatedPaymentResponse } from '../utils/interface';

export interface IPaymentRepository {
  makePayment(input: Partial<PaymentEntity>): Promise<PaymentEntity>;
  findPayment(paymentId: string): Promise<PaymentEntity>;
  findPayments(filter: PaymentFilter): Promise<PaginatedPaymentResponse>;
}
