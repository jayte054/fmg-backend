import { SubAccountEntity } from '../entity/subaccount.entity';
import { SubAccountFilter, PaginatedAccountResponse } from '../utils/interface';

export interface ISubAccountRepository {
  createSubAccount(input: Partial<SubAccountEntity>): Promise<SubAccountEntity>;
  findSubAccount(subAccountId: string): Promise<SubAccountEntity>;
  findSubAccountUserId(dealerId: string): Promise<SubAccountEntity>;
  findSubAccounts(filter: SubAccountFilter): Promise<PaginatedAccountResponse>;
  updateSubAccount(
    subAccountCode: string,
    metadata: Record<string, string>,
  ): Promise<SubAccountEntity | string>;
}
