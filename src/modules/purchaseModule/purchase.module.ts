import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../usersModule/user.module';
import { PurchaseEntity } from './purchaseEntity/purchase.entity';
import { BuyerRepositoryMiddleware } from 'src/common/middleware/buyer.repository.middleware';
import { PurchaseController } from './purchaseController/purchase.controller';
import { PurchaseRepository } from './purchaseRepository/purchase.repository';
import { PurchaseService } from './purchaseService/purchase.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseEntity]), UserModule],
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
    consumer.apply(BuyerRepositoryMiddleware).forRoutes(PurchaseController);
  }
}
