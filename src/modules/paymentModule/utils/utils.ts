import {
  AccountsInterface,
  PaginatedAccountResponse,
  PaginatedPaymentResponse,
  PaginatedWalletResponse,
  PaymentInterface,
  WalletInterface,
} from './interface';

export const paginatedPayment = async (
  paymentInterface: PaymentInterface,
): Promise<PaginatedPaymentResponse> => {
  const { payments, total, skip, take } = paymentInterface;

  return {
    payments,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};

export const PaginatedSubAccount = async (
  accountsInterface: AccountsInterface,
): Promise<PaginatedAccountResponse> => {
  const { accounts, total, skip, take } = accountsInterface;

  return {
    accounts,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};

export const paginatedWallet = async (
  walletInterface: WalletInterface,
): Promise<PaginatedWalletResponse> => {
  const { wallets, total, skip, take } = walletInterface;

  return {
    wallets,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};
