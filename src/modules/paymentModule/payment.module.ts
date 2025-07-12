import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { SubAccountEntity } from './entity/subaccount.entity';
import { WalletEntity } from './entity/wallet.entity';
import { PaymentService } from './service/payment.service';
import { PaymentRepository } from './repository/payment.repository';
import { ProductModule } from '../ProductModule/product.module';
import { SubAccountRepository } from './repository/subaccount.repository';
import { WalletRepository } from './repository/wallet.repository';
import { UserModule } from '../usersModule/user.module';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from '../notificationModule/notification.module';
import { PaymentController } from './controller/payment.controller';
import { BuyerRepositoryMiddleware } from 'src/common/middleware/buyer.repository.middleware';

@Module({
  imports: [
    forwardRef(() => NotificationModule),
    HttpModule,
    forwardRef(() => UserModule),
    AuditLogModule,
    forwardRef(() => ProductModule),
    TypeOrmModule.forFeature([PaymentEntity, SubAccountEntity, WalletEntity]),
  ],
  providers: [
    PaymentService,
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    {
      provide: 'ISubAccountRepository',
      useClass: SubAccountRepository,
    },
    {
      provide: 'IWalletRepository',
      useClass: WalletRepository,
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BuyerRepositoryMiddleware).forRoutes(PaymentController);
  }
}
