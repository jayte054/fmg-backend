import { CashbackWalletEntity } from '../entity/cashback.entity';
import {
  CashbackWalletFilter,
  PaginatedCashbackWalletResponse,
  UpdateCashbackInputInterface,
} from '../utils/interface';

export interface ICashbackWalletRepository {
  createCashbackWallet(
    input: Partial<CashbackWalletEntity>,
  ): Promise<CashbackWalletEntity>;
  findCashbackWallet(walletId: string): Promise<CashbackWalletEntity>;
  findCashbackWalletByUserId(userId: string): Promise<CashbackWalletEntity>;
  findCashbackWallets(
    filter: CashbackWalletFilter,
  ): Promise<PaginatedCashbackWalletResponse>;
  updateCashbackWallet(
    walletId: string,
    updateInput: UpdateCashbackInputInterface,
  ): Promise<CashbackWalletEntity>;
  toggleCashbackWalletStatus(walletId: string): Promise<{ ok: true }>;
}
