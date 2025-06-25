import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../usersModule/user.module';
import { PurchaseEntity } from './purchaseEntity/purchase.entity';
import { BuyerRepositoryMiddleware } from 'src/common/middleware/buyer.repository.middleware';
import { PurchaseController } from './purchaseController/purchase.controller';
import { PurchaseRepository } from './purchaseRepository/purchase.repository';
import { PurchaseService } from './purchaseService/purchase.service';
import { NotificationModule } from '../notificationModule/notification.module';
import { ProductModule } from '../ProductModule/product.module';
import { DriverRepositoryMiddleware } from 'src/common/middleware/driver.repository.middleware';
import { DealerRepositoryMiddleware } from 'src/common/middleware/dealer.repository.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity]),
    UserModule,
    NotificationModule,
    ProductModule,
  ],
  controllers: [PurchaseController],
  providers: [
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
