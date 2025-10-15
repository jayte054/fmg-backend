import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionEntity } from '../entity/transaction.entity';
import { DataSource, Repository } from 'typeorm';
import {
  PaginatedTransactionResponse,
  TransactionFilterInterface,
} from '../utils/interface';
import { paginatedTransactionsResponse } from '../utils/utils';

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
  constructor(private datasource: DataSource) {
    super(TransactionEntity, datasource.createEntityManager());
  }

  async createTransaction(
    input: Partial<TransactionEntity> | Partial<TransactionEntity>[],
  ): Promise<TransactionEntity | TransactionEntity[]> {
    if (Array.isArray(input)) {
      const newTransaction = this.create(input);
      return await this.save(newTransaction);
    }
    const newTransaction = this.create(input);
    const transaction = await this.save(newTransaction);
    return transaction;
  }

  async findTransaction(input: {
    transactionId?: string;
    reference?: string;
  }): Promise<TransactionEntity> {
    const { transactionId, reference } = input;
    const query = this.createQueryBuilder('transaction');

    if (transactionId) {
      query.andWhere('transaction.transactionId = :transactionId', {
        transactionId,
      });
    }

    if (reference) {
      query.andWhere('transaction.reference = :reference', { reference });
    }

    return await query.getOne();
  }

  async findTransactions(
    filter: TransactionFilterInterface,
  ): Promise<PaginatedTransactionResponse> {
    const { search, type, status, createdAt, skip, take } = filter;

    const query = this.createQueryBuilder('transaction');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere('transaction.reference ILIKE :lowerCaseSearch', {
        lowerCaseSearch,
      });
    }

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      query.andWhere('transaction.status = :status', { status });
    }

    if (location) {
      query.andWhere('transaction.location = :location', { location });
    }

    if (createdAt) {
      query.andWhere('transaction.createdAt = :createdAt', { createdAt });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    const [transactions, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedTransactionsResponse({
      transactions,
      total,
      skip,
      take,
    });
  }

  async updateTransaction(
    input: Partial<TransactionEntity>,
    transactionId?: string,
    reference?: string,
  ): Promise<{ ok: boolean }> {
    if (!transactionId && !reference) {
      throw new BadRequestException(
        'Either transactionId or reference is required',
      );
    }
    const transaction = await this.findOne({
      where: [
        transactionId ? { transactionId } : {},
        reference ? { reference } : {},
      ],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updateTransaction = await this.update(
      transaction.transactionId,
      input,
    );

    if (updateTransaction.affected < 1) {
      return {
        ok: false,
      };
    }
    return { ok: true };
  }
}
