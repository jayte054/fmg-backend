import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { PaymentService } from 'src/modules/paymentModule/service/payment.service';
import {
  WalletFilter,
  WalletUserEnum,
} from 'src/modules/paymentModule/utils/interface';
import {
  AdminPaymentFilterDto,
  CashbackWalletFilterDto,
  RevenueFilterDto,
} from 'src/modules/paymentModule/utils/payment.dto';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@Injectable()
export class AdminPaymentService {
  private readonly logger = new Logger(AdminPaymentService.name);
  constructor(
    private readonly paymentService: PaymentService,
    private readonly auditLogService: AuditLogService,
  ) {}

  viewPayments = async (
    admin: AdminEntity,
    paymentFilter: AdminPaymentFilterDto,
  ) => {
    const payments = await this.paymentService.findPaymentsByAdmin(
      admin.adminId,
      paymentFilter,
    );

    return payments;
  };

  viewPayment = async (admin: AdminEntity, paymentId: string) => {
    const payment = await this.paymentService.findPaymentByAdmin(
      admin.adminId,
      paymentId,
    );

    return payment;
  };

  fetchRevenueHistory = async (
    admin: AdminEntity,
    filterDto: RevenueFilterDto,
  ) => {
    const history = await this.paymentService.fetchRevenues(
      admin.adminId,
      filterDto,
    );

    return history;
  };

  fetchRevenue = async (admin: AdminEntity, revenueId: string) => {
    const revenue = await this.paymentService.fetchRevenue(
      admin.adminId,
      revenueId,
    );

    return {
      message: 'revenue detail fetched successfully',
      data: revenue,
    };
  };

  fetchTotalRevenue = async (admin: AdminEntity) => {
    const response = await this.paymentService.calculateRevenue(admin.adminId);

    return response;
  };

  fetchBuyerCashbackWalletStats = async (admin: AdminEntity) => {
    const stats = await this.paymentService.getCashbackStats(admin.adminId);

    return stats;
  };

  fetchCashbackWallets = async (
    admin: AdminEntity,
    filterDto: CashbackWalletFilterDto,
  ) => {
    const wallets = await this.paymentService.findCashbackWallets(
      admin.adminId,
      filterDto,
    );

    return wallets;
  };

  fetchStatsByUserType = async (admin: AdminEntity, type: WalletUserEnum) => {
    const stats = await this.paymentService.getWalletStats(admin.adminId, type);

    return stats;
  };

  fetchWalletByUserType = async (admin: AdminEntity, filter: WalletFilter) => {
    const wallets = await this.paymentService.getWallets(admin.adminId, filter);

    return wallets;
  };

  fetchWallet = async (admin: AdminEntity, walletId: string) => {
    const wallet = await this.paymentService.getWalletByAdmin(
      admin.adminId,
      walletId,
    );

    return wallet;
  };
}
