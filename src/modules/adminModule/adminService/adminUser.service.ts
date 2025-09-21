import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { CashbackWalletFilterDto } from 'src/modules/paymentModule/utils/payment.dto';
import { BuyerService } from 'src/modules/usersModule/service/buyer.service';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { BuyersFilterDto } from 'src/modules/usersModule/utils/user.dto';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(
    private readonly buyerService: BuyerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  fetchBuyers = async (admin: AdminEntity, filterDto: BuyersFilterDto) => {
    const buyers = await this.buyerService.findBuyers(filterDto, admin.adminId);

    return buyers;
  };

  fetchBuyer = async (admin: AdminEntity, buyerId: string) => {
    const buyer = await this.buyerService.findBuyer(buyerId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched buyer',
      email: buyer.email,
      details: {
        admin: admin.adminId,
        buyerId,
      },
    });

    this.logger.log('buyer fetched successfully by ', admin.adminId);
    return buyer;
  };

  fetchBuyerCashbackWalletStats = async (
    admin: AdminEntity,
    filterDto: CashbackWalletFilterDto,
  ) => {};
}
