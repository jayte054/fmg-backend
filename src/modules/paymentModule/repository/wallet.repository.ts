import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletEntity } from '../entity/wallet.entity';
import {
  PaginatedWalletResponse,
  UpdateWalletData,
  WalletFilter,
  WalletStatus,
  WalletUserEnum,
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
    const { balance, previousBalance, metadata, updatedAt } = updateWalletData;
    const wallet = await this.findOne({ where: { walletAccount } });
    wallet.balance = balance ?? wallet.balance;
    wallet.previousBalance = previousBalance ?? wallet.previousBalance;
    wallet.metadata = metadata ?? wallet.metadata;
    wallet.updatedAt = updatedAt;
    return await this.save(wallet);
  };

  getWalletStats = async (type: WalletUserEnum) => {
    const result = await this.createQueryBuilder('wallets')
      .select('COUNT(wallets."walletId"', 'totalWallets')
      .addSelect(
        'COUNT(CASE WHEN wallets."status" = :active THEN 1 END)',
        'activeWallets',
      )
      .addSelect(`SUM(wallets.balance::numeric)`, 'totalBalance')
      .addSelect('AVG(wallets.balance::numeric)', 'averageBalance')
      .where('wallets.type = :type', { type })
      .setParameter('active', WalletStatus.active)
      .getRawOne();

    return {
      totalWallets: Number(result.totalWallets) ?? 0,
      activeWallet: Number(result.activeWallets) ?? 0,
      totalBalance: Number(result.totalBalance) ?? 0,
      averageBalance: Number(result.averageBalance) ?? 0,
    };
  };
}
