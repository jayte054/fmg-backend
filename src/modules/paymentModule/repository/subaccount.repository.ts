import { Injectable } from '@nestjs/common';
import { SubAccountEntity } from '../entity/subaccount.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginatedAccountResponse, SubAccountFilter } from '../utils/interface';
import { PaginatedSubAccount } from '../utils/utils';

@Injectable()
export class SubAccountRepository extends Repository<SubAccountEntity> {
  constructor(dataSource: DataSource) {
    super(SubAccountEntity, dataSource.createEntityManager());
  }

  createSubAccount = async (
    input: Partial<SubAccountEntity>,
  ): Promise<SubAccountEntity> => {
    const newAccount = this.create(input);
    const account = await this.save(newAccount);
    return account;
  };

  findSubAccount = async (subAccountId: string): Promise<SubAccountEntity> => {
    const query = this.createQueryBuilder('account');
    query.where('account.subAccountId = :subAccountId', { subAccountId });

    return await query.getOne();
  };

  findSubAccountUserId = async (
    dealerId: string,
  ): Promise<SubAccountEntity> => {
    const query = this.createQueryBuilder('account');
    query.where(`account.metadata ->> 'dealerId' = :dealerId`, { dealerId });

    return await query.getOne();
  };

  findSubAccounts = async (
    filter: SubAccountFilter,
  ): Promise<PaginatedAccountResponse> => {
    const { search, skip, take } = filter;
    const query = this.createQueryBuilder('accounts');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(
        `
        LOWER(accounts.bankName) ILIKE :lowerCaseSearch 
        OR LOWER(accounts.bankCode) LIKE :lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    const [accounts, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return PaginatedSubAccount({ accounts, total, skip, take });
  };

  updateSubAccount = async (
    subAccountCode: string,
    metadata: Record<string, string>,
  ): Promise<SubAccountEntity | string> => {
    const account = await this.update({ subAccountCode }, { metadata });

    if (account.affected === 0) {
      return 'failed to update account';
    }

    return await this.findOne({ where: { subAccountCode } });
  };
}
