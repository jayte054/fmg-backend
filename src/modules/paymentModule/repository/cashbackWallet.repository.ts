import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CashbackWalletEntity } from '../entity/cashback.entity';
import {
  CashbackWalletFilter,
  UpdateCashbackInputInterface,
} from '../utils/interface';
import { paginatedCashbackWallets } from '../utils/utils';

@Injectable()
export class CashbackWalletRepository extends Repository<CashbackWalletEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CashbackWalletEntity, dataSource.createEntityManager());
  }

  createCashbackWallet = async (input: Partial<CashbackWalletEntity>) => {
    const newWallet = this.create(input);
    const wallet = await this.save(newWallet);
    return wallet;
  };

  findCashbackWallet = async (walletId: string) => {
    const query = this.createQueryBuilder('wallet');
    query.where('wallet.walletId = :walletId', { walletId });
    return query.getOne();
  };

  findCashbackWalletByUserId = async (userId: string) => {
    const query = this.createQueryBuilder('wallet');
    query.andWhere('wallet.userId = :userId', { userId });
    return query.getOne();
  };

  findCashbackWallets = async (filter: CashbackWalletFilter) => {
    const { search, isActive, balance, createdAt, skip, take } = filter;

    const query = this.createQueryBuilder('wallets');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(
        `
            LOWER(wallets.username) ILIKE :lowercaseSearch
            LOWER(wallets.accountNumber) ILIKE :lowercaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (isActive) {
      query.andWhere('wallets.isActive = :isActive', { isActive });
    }

    if (balance) {
      const parsedBalance = parseFloat(balance);
      query.andWhere('wallets.balance >= :balance', { parsedBalance });
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endofDay = new Date(createdAt);
      endofDay.setHours(23, 59, 59, 999);

      query.andWhere('wallets.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endofDay,
      });
    }

    const [wallets, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedCashbackWallets({
      wallets,
      total,
      skip,
      take,
    });
  };

  updateCashbackWallet = async (
    walletId: string,
    updateInput: UpdateCashbackInputInterface,
  ) => {
    const updateWallet = await this.update({ walletId }, updateInput);
    if (updateWallet.affected === 0) {
      throw new NotFoundException(`wallet ${walletId} not found`);
    }
    return await this.findOne({ where: { walletId } });
  };

  toggleCashbackWalletStatus = async (walletId: string) => {
    const wallet = await this.findOne({ where: { walletId } });
    const prev = wallet.isActive;
    wallet.isActive = !prev;
    await this.save(wallet);
    return { ok: true };
  };

  getCashbackWalletStats = async () => {}
}
