import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { AdminController } from './adminController/admin.controller';
import { AdminRepositoryMiddleware } from 'src/common/middleware/admin.repository.middleware';
import { AdminAuditLogService } from './adminService/adminAuditLog.service';
import { AdminEntityRepository } from '../usersModule/repository/admin.entity.repository';
import { PaymentModule } from '../paymentModule/payment.module';
import { AdminPaymentService } from './adminService/adminPayment.service';
import { ProductModule } from '../ProductModule/product.module';
import { AdminProductService } from './adminService/adminProduct.service';
import { PurchaseModule } from '../purchaseModule/purchase.module';
import { AdminPurchaseService } from './adminService/adminPurchase.service';

@Module({
  imports: [AuditLogModule, PaymentModule, ProductModule, PurchaseModule],
  controllers: [AdminController],
  providers: [
    AdminPurchaseService,
    AdminProductService,
    AdminPaymentService,
    AdminAuditLogService,
    AdminEntityRepository,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminRepositoryMiddleware).forRoutes(AdminController);
  }
}
