import { WalletEntity } from '../entity/wallet.entity';
import {
  WalletFilter,
  PaginatedWalletResponse,
  UpdateWalletData,
} from '../utils/interface';

export interface IWalletRepository {
  createWallet(input: Partial<WalletEntity>): Promise<WalletEntity>;
  findWallet(walletId: string): Promise<WalletEntity>;
  findWalletUserId(userId?: string): Promise<WalletEntity>;
  findWallets(filter: WalletFilter): Promise<PaginatedWalletResponse>;
  updateWallet(
    walletAccount: string,
    updateWalletData: UpdateWalletData,
  ): Promise<WalletEntity>;
}
