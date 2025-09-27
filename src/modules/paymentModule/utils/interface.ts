import { CashbackWalletEntity } from '../entity/cashback.entity';
import { PaymentEntity } from '../entity/payment.entity';
import { RevenueEntity } from '../entity/revenue.entity';
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
  createdAt?: Date;
  status?: string;
  skip: number;
  take: number;
}

export interface AdminPaymentFilter {
  search?: string;
  createdAt?: Date;
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

export interface CashbackWalletInterface {
  wallets: CashbackWalletEntity[];
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

export interface PaginatedCashbackWalletResponse {
  wallets: CashbackWalletEntity[];
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

export interface CashbackWalletFilter {
  search?: string;
  isActive?: boolean;
  balance?: string;
  createdAt?: Date;
  skip: number;
  take: number;
}

export interface UpdateCashbackInputInterface {
  balance?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateCashbackWalletResponse {
  message: string;
  status: string;
  data: CashbackWalletEntity;
}

export interface AdminPaymentResponseInterface {
  paymentId: string;

  email: string;

  purchaseId: string;

  reference: string;

  amount: number;

  productAmount: number;

  deliveryFee: number;

  driverShare: number;

  platformCommission: number;

  dealerSubAccount: string;

  dealersWalletAccount: string;

  driversWalletAccount: string;

  status: PaymentStatus;

  createdAt: Date;

  metadata?: Record<string, string>;
}

export interface BuyerPaymentResponseInterface {
  paymentId: string;

  email: string;

  purchaseId: string;

  reference: string;

  amount: number;

  productAmount: number;

  deliveryFee: number;

  status: PaymentStatus;

  createdAt: string;

  metadata?: Record<string, string>;
}

export enum RevenueSource {
  DebutGasPurchase = 'DebutGasOurchase',
  GasPurchase = 'GasPurchase',
  AccessoryPurchase = 'AccessoryPurchase',
}

export interface RevenueFilter {
  search?: string;
  isReversed?: boolean;
  recordedAt?: Date;
  skip: number;
  take: number;
}

export interface PaginatedRevenueInterface {
  revenues: RevenueEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedRevenueResponse {
  revenues: RevenueEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface CashbackWalletStatsInterface {
  totalWallets: number;
  activeWallet: number;
  totalBalance: number;
  averageBalance: number;
}
