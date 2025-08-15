import { CashbackWalletEntity } from '../entity/cashback.entity';
import {
  CashbackWalletFilter,
  UpdateCashbackInputInterface,
} from '../utils/interface';

export interface ICashbackWalletInterface {
  createCashbackWallet(
    input: Partial<CashbackWalletEntity>,
  ): Promise<CashbackWalletEntity>;
  findCashbackWallet(walletId: string): Promise<CashbackWalletEntity>;
  findCashbackWalletByUserId(userId: string): Promise<CashbackWalletEntity>;
  findCashbackWallets(
    filter: CashbackWalletFilter,
  ): Promise<CashbackWalletEntity>;
  updateCashbackWallet(
    walletId: string,
    updateInput: UpdateCashbackInputInterface,
  ): Promise<CashbackWalletEntity>;
}
