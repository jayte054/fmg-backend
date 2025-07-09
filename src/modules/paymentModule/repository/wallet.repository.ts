import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletEntity } from '../entity/wallet.entity';
import {
  PaginatedWalletResponse,
  UpdateWalletData,
  WalletFilter,
} from '../utils/interface';
import { paginatedWallet } from '../utils/utils';

@Injectable()
export class WalletRepository extends Repository<WalletEntity> {
  constructor(dataSource: DataSource) {
    super(WalletEntity, dataSource.createEntityManager());
  }

  createWallet = async (
    input: Partial<WalletEntity>,
  ): Promise<WalletEntity> => {
    const newWallet = this.create(input);
    const wallet = await this.save(newWallet);
    return wallet;
  };

  findWallet = async (walletId?: string): Promise<WalletEntity> => {
    const query = this.createQueryBuilder('wallet');
    query.where('wallet.walletId = :walletId', { walletId });
    return await query.getOne();
  };

  findWalletUserId = async (userId?: string): Promise<WalletEntity> => {
    const query = this.createQueryBuilder('wallet');
    query.where('wallet.userId = :userId', { userId });
    return await query.getOne();
  };

  findWallets = async (
    filter: WalletFilter,
  ): Promise<PaginatedWalletResponse> => {
    const { search, status, createdAt, skip, take } = filter;
    const query = this.createQueryBuilder('wallet');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(
        `
            LOWER(wallet.walletAccount) ILIKE :lowerCaseSearch
            OR LOWER(wallet.walletName) ILIKE : lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (status) {
      query.andWhere('wallet.status = :status', { status });
    }

    if (createdAt) {
      query.andWhere('wallet.createdAt = :createdAt', { createdAt });
    }

    const [wallets, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedWallet({ wallets, total, skip, take });
  };

  updateWallet = async (
    walletAccount: string,
    updateWalletData: UpdateWalletData,
  ): Promise<WalletEntity> => {
    const updateQuery = await this.update(walletAccount, updateWalletData);

    if (updateQuery.affected < 1)
      return await this.findOne({ where: { walletAccount } });
  };
}
