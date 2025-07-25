import { PaymentEntity } from '../entity/payment.entity';
import { SubAccountEntity } from '../entity/subaccount.entity';
import { WalletEntity } from '../entity/wallet.entity';

export enum PaymentStatus {
  pending = 'pending',
  paid = 'paid',
  failed = 'failed',
}

export enum WalletStatus {
  active = 'active',
  inactive = 'inactive',
}

export interface PaymentFilter {
  userId: string;
  search?: string;
  createdAt?: string;
  status?: string;
  skip: number;
  take: number;
}

export interface PaymentInterface {
  payments: PaymentEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedPaymentResponse {
  payments: PaymentEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface SubAccountFilter {
  search?: string;
  skip: number;
  take: number;
}

export interface AccountsInterface {
  accounts: SubAccountEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedAccountResponse {
  accounts: SubAccountEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface WalletFilter {
  search?: string;
  status?: string;
  createdAt?: string;
  skip: number;
  take: number;
}

export interface WalletInterface {
  wallets: WalletEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedWalletResponse {
  wallets: WalletEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface UpdateWalletData {
  status?: WalletStatus;
  balance?: number;
  previousBalance?: number;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

export interface SubAccountResponse {
  sub_account: SubAccountEntity;
  message: string;
}

export interface ActivateSubAccountInterface {
  business_name: string;
  bank_code: string;
  account_number: string;
  active: boolean;
  subaccount_code: string;
}
