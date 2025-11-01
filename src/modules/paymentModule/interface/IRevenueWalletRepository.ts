import { RevenueWalletEntity } from '../entity/revenueWallet.entity';
import {
  PaginatedRevenueWalletResponse,
  RevenueWalletFilterInterface,
  RevenueWalletsFilterInterface,
} from '../utils/interface';

export interface IRevenueWalletRepository {
  createRevenueWallet(
    input: Partial<RevenueWalletEntity>,
  ): Promise<RevenueWalletEntity>;
  fetchRevenueWallet(
    walletFilter: RevenueWalletFilterInterface,
  ): Promise<RevenueWalletEntity>;
  fetchRevenueWallets(
    walletsFilter: RevenueWalletsFilterInterface,
  ): Promise<PaginatedRevenueWalletResponse>;
  updateWallet(
    walletId: string,
    input: Partial<RevenueWalletEntity>,
  ): Promise<RevenueWalletEntity>;
}
