import { TransactionEntity } from '../entity/transaction.entity';
import {
  TransactionFilterInterface,
  PaginatedTransactionResponse,
} from '../utils/interface';

export interface ITransactionRepositoryInterface {
  createTransaction(
    input: Partial<TransactionEntity> | Partial<TransactionEntity>[],
  ): Promise<TransactionEntity | Partial<TransactionEntity>[]>;
  findTransaction(input: {
    transactionId?: string;
    reference?: string;
  }): Promise<TransactionEntity>;
  findTransactions(
    filter: TransactionFilterInterface,
  ): Promise<PaginatedTransactionResponse>;
  updateTransaction(
    input: Partial<TransactionEntity>,
    transactionId?: string,
    reference?: string,
  ): Promise<{ ok: boolean }>;
}
