import { DataSource, Repository } from 'typeorm';
import { PaymentEntity } from '../entity/payment.entity';
import { Injectable } from '@nestjs/common';
import {
  AdminPaymentFilter,
  PaginatedPaymentResponse,
  PaymentFilter,
} from '../utils/interface';
import { paginatedPayment } from '../utils/utils';

@Injectable()
export class PaymentRepository extends Repository<PaymentEntity> {
  constructor(private dataSource: DataSource) {
    super(PaymentEntity, dataSource.createEntityManager());
  }

  async makePayment(input: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const newPayment = this.create(input);
    const payment = await this.save(newPayment);

    return payment;
  }

  async findPayment(paymentId: string): Promise<PaymentEntity> {
    const query = this.createQueryBuilder('payment');

    query.where('payment.paymentId = :paymentId', { paymentId });

    const payment = await query.getOne();
    return payment;
  }

  async findPayments(filter: PaymentFilter): Promise<PaginatedPaymentResponse> {
    const { userId, search, createdAt, status, skip, take } = filter;
    const query = this.createQueryBuilder('payments');

    query.where('payments.userId = :userId', { userId });

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(
        `
        LOWER(payments.email) ILIKE :lowerCaseSearch 
        OR LOWER(payments.userId) ILIKE :lowerCaseSearch
        OR LOWER(payments.reference) ILIKE :reference
        `,
        { lowerCaseSearch },
      );
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('payments.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (status) {
      query.andWhere('payments.status = :status', { status });
    }

    const [payments, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedPayment({ payments, total, skip, take });
  }

  async findPaymentsByAdmin(
    filter: AdminPaymentFilter,
  ): Promise<PaginatedPaymentResponse> {
    const { search, createdAt, status, skip, take } = filter;
    const query = this.createQueryBuilder('payments');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(
        `
        LOWER(payments.email) ILIKE :lowerCaseSearch 
        OR LOWER(payments.userId) ILIKE :lowerCaseSearch
        OR LOWER(payments.reference) ILIKE :reference
        `,
        { lowerCaseSearch },
      );
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('payments.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (status) {
      query.andWhere('payments.status = :status', { status });
    }

    const [payments, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedPayment({ payments, total, skip, take });
  }
}
