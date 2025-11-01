import { CashbackWalletEntity } from '../entity/cashback.entity';
import { PaymentEntity } from '../entity/payment.entity';
import { RevenueEntity } from '../entity/revenue.entity';
import { RevenueWalletEntity } from '../entity/revenueWallet.entity';
import { SubAccountEntity } from '../entity/subaccount.entity';
import { TransactionEntity } from '../entity/transaction.entity';
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
  type?: WalletUserEnum;
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

export enum WalletUserEnum {
  driver = 'driver',
  dealer = 'dealer',
  buyer = 'buyer',
}

export enum TransactionType {
  credit = 'credit',
  debit = 'debit',
  reversal = 'reversal',
  settlement = 'settlement',
}

export enum TransactionStatus {
  pending = 'pending',
  processing = 'processing',
  success = 'success',
  failed = 'failed',
}

export interface TransactionFilterInterface {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  createdAt?: Date;
  skip: number;
  take: number;
}

export interface PaginatedTransactionResponse {
  transactions: TransactionEntity[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface PaginatedTransactionInterfaceResponse {
  transactions: TransactionEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: PaystackTransactionData | any;
}

export interface PaystackTransactionData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  receipt_number: string | null;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, any> | string | null;
  log: PaystackTransactionLog | null;
  fees: number;
  fees_split: any | null;
  authorization: PaystackAuthorization;
  customer: PaystackCustomer;
  plan: string | null;
  split: Record<string, any>;
  order_id: string | null;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data: any | null;
  source: any | null;
  fees_breakdown: any | null;
  connect: any | null;
  transaction_date: string;
  plan_object: Record<string, any>;
  subaccount: Record<string, any>;
}

export interface PaystackTransactionLog {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  history: PaystackTransactionHistory[];
}

export interface PaystackTransactionHistory {
  type: string;
  message: string;
  time: number;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string | null;
}

export interface PaystackCustomer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
  metadata: any | null;
  risk_action: string;
  international_format_phone: string | null;
}

export class JobInterface {
  name: string;
  data: {
    reference?: string;
  };
}

export interface BuyerWalletResponse {
  message: string;
  status: number;
  wallet: WalletEntity;
}

export interface RevenueWalletMetadata {
  totalRevenue?: number;
  numberOfCredits?: number;
  lastTransactionDate?: string;
  [key: string]: any;
}

export interface RevenueWalletFilterInterface {
  userId?: string;
  revenueWalletId?: string;
}

export interface RevenueWalletsFilterInterface {
  search?: string;
  userType?: WalletUserEnum;
  createdAt?: Date;
  skip: number;
  take: number;
}

export interface PaginatedRevenueWalletInterface {
  wallets: RevenueWalletEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedRevenueWalletResponse {
  wallets: RevenueWalletEntity[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface CreateRevenueWalletInterface {
  name: string;
  userId: string;
  userType: WalletUserEnum;
}

export interface UpdateRevenueWalletInterface {
  revenueWalletId: string;
  amount: number;
  revenueId: string;
}
