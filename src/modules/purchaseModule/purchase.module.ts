import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../usersModule/user.module';
import { PurchaseEntity } from './purchaseEntity/purchase.entity';
import { BuyerRepositoryMiddleware } from '../../common/middleware/buyer.repository.middleware';
import { PurchaseController } from './purchaseController/purchase.controller';
import { PurchaseRepository } from './purchaseRepository/purchase.repository';
import { PurchaseService } from './purchaseService/purchase.service';
import { NotificationModule } from '../notificationModule/notification.module';
import { ProductModule } from '../ProductModule/product.module';
import { DriverRepositoryMiddleware } from '../../common/middleware/driver.repository.middleware';
import { DealerRepositoryMiddleware } from '../../common/middleware/dealer.repository.middleware';
import { TokenModule } from '../tokenModule/token.module';
import { MailerService } from '../notificationModule/notificationService/mailerService';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { PaymentModule } from '../paymentModule/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity]),
    UserModule,
    NotificationModule,
    ProductModule,
    TokenModule,
    AuditLogModule,
    PaymentModule,
  ],
  controllers: [PurchaseController],
  providers: [
    MailerService,
    PurchaseService,
    {
      provide: 'IPurchaseRepository',
      useClass: PurchaseRepository,
    },
  ],
  exports: [],
})
export class PurchaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        BuyerRepositoryMiddleware,
        DriverRepositoryMiddleware,
        DealerRepositoryMiddleware,
      )
      .forRoutes(PurchaseController);
  }
}
