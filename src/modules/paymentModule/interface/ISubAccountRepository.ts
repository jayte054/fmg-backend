import { SubAccountEntity } from '../entity/subaccount.entity';
import { SubAccountFilter, PaginatedAccountResponse } from '../utils/interface';

export interface ISubAccountRepository {
  createSubAccount(input: Partial<SubAccountEntity>): Promise<SubAccountEntity>;
  findSubAccount(subAccountId: string): Promise<SubAccountEntity>;
  findSubAccountUserId(userId: string): Promise<SubAccountEntity>;
  findSubAccounts(filter: SubAccountFilter): Promise<PaginatedAccountResponse>;
}
