import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { PurchaseService } from 'src/modules/purchaseModule/purchaseService/purchase.service';
import { PurchaseFilterDto } from 'src/modules/purchaseModule/utils/purchase.dto';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@Injectable()
export class AdminPurchaseService {
  private readonly logger = new Logger(AdminPurchaseService.name);
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  fetchPurchases = async (admin: AdminEntity, filter: PurchaseFilterDto) => {
    const purchases = await this.purchaseService.findPurchases(filter);

    this.auditLogService.log({
      logCategory: LogCategory.PURCHASE,
      description: 'find purchases',
      email: admin.email,
      details: {
        count: purchases.data.length.toString(),
        filter: JSON.stringify(filter),
        adminId: admin.adminId,
      },
    });

    this.logger.log('purchases fetched successfully by admin', admin.adminId);

    return purchases;
  };

  fetchPurchase = async (admin: AdminEntity, purchaseId: string) => {
    const purchase =
      await this.purchaseService.findPurchaseByIdPayment(purchaseId);

    return purchase;
  };

  //   getPurchaseStats = async (admin: AdminEntity) => {
  //     const purchases = await this.purchaseService.findPurchasesForStat(
  //       admin.adminId,
  //     );

  //     let totalPurchases = 0;
  //     let totalSpent = 0;
  //     let totalDeliverySpent = 0;

  //     for (const purchase of purchases) {
  //       const count = 1 + Number(purchase.accessoryIds?.length) || 0;
  //       totalPurchases += count;

  //       totalSpent += Number(purchase.price) || 0;
  //       totalDeliverySpent += Number(purchase.deliveryFee) || 0;
  //     }

  //     return {
  //       totalPurchases,
  //       totalSpent,
  //       totalDeliverySpent,
  //     };
  //   };

  getPurchaseStats = async (admin: AdminEntity) => {
    const purchases = await this.purchaseService.findPurchasesForStat(
      admin.adminId,
    );

    return purchases;
  };
}
