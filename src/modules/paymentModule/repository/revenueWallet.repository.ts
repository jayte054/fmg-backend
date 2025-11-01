import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RevenueWalletEntity } from '../entity/revenueWallet.entity';
import { DataSource, Repository } from 'typeorm';
import {
  RevenueWalletFilterInterface,
  RevenueWalletsFilterInterface,
} from '../utils/interface';
import { paginatedRevenueWallet } from '../utils/utils';

@Injectable()
export class RevenueWalletRepository extends Repository<RevenueWalletEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RevenueWalletEntity, dataSource.createEntityManager());
  }

  createRevenueWallet = async (input: Partial<RevenueWalletEntity>) => {
    const newWallet = this.create(input);
    const wallet = await this.save(newWallet);
    return wallet;
  };

  fetchRevenueWallet = async (walletFilter: RevenueWalletFilterInterface) => {
    const wallet = await this.findOne({ where: walletFilter });
    return wallet;
  };

  fetchRevenueWallets = async (
    walletsFilter: RevenueWalletsFilterInterface,
  ) => {
    const { search, userType, createdAt, skip, take } = walletsFilter;

    const query = this.createQueryBuilder('wallets');

    query.where('wallets.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere('wallets.name ILIKE :lowerCaseSearch', {
        lowerCaseSearch,
      });
    }

    if (userType) {
      query.andWhere('wallets.userType = :userType', { userType });
    }

    if (createdAt) {
      query.andWhere('wallets.createdAt = :createdAt', { createdAt });
    }

    query.orderBy('wallets.createdAt', 'DESC');

    const [wallets, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedRevenueWallet({ wallets, total, skip, take });
  };

  updateWallet = async (
    walletId: string,
    input: Partial<RevenueWalletEntity>,
  ) => {
    const updateResult = await this.update(walletId, input);

    if (updateResult.affected < 1) {
      throw new InternalServerErrorException('failed to update wallet');
    }

    return await this.findOne({ where: { revenueWalletId: walletId } });
  };
}
