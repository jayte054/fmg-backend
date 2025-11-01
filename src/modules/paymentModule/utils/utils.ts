import {
  AccountsInterface,
  CashbackWalletInterface,
  PaginatedAccountResponse,
  PaginatedCashbackWalletResponse,
  PaginatedPaymentResponse,
  PaginatedRevenueInterface,
  PaginatedRevenueResponse,
  PaginatedRevenueWalletInterface,
  PaginatedRevenueWalletResponse,
  PaginatedTransactionInterfaceResponse,
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

export const paginatedCashbackWallets = async (
  walletInterface: CashbackWalletInterface,
): Promise<PaginatedCashbackWalletResponse> => {
  const { wallets, total, skip, take } = walletInterface;

  return {
    wallets,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};

export const paginatedRevenue = async (
  revenueInterface: PaginatedRevenueInterface,
): Promise<PaginatedRevenueResponse> => {
  const { revenues, total, skip, take } = revenueInterface;

  return {
    revenues,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};

export const paginatedTransactionsResponse = (
  paginatedTransactionInterface: PaginatedTransactionInterfaceResponse,
) => {
  const { transactions, total, skip, take } = paginatedTransactionInterface;
  if (!transactions || transactions.length === 0) {
    return {
      transactions: [],
      total: 0,
      page: 0,
      perPage: 0,
      hasMore: false,
    };
  }

  return {
    transactions,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
    hasMore: skip + transactions.length < total,
  };
};

export const paginatedRevenueWallet = (
  paginatedRevenueWalletInterface: PaginatedRevenueWalletInterface,
): PaginatedRevenueWalletResponse => {
  const { wallets, total, skip, take } = paginatedRevenueWalletInterface;
  if (!wallets || wallets.length === 0) {
    return {
      wallets: [],
      total: 0,
      page: 0,
      perPage: 0,
      hasMore: false,
    };
  }

  return {
    wallets,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
    hasMore: skip + wallets.length < total,
  };
};
