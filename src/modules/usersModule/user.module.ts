import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerEntity } from './userEntity/buyer.entity';
import { BuyerRepository } from './repository/buyer.repository';
import { BuyerService } from './service/buyer.service';
import { BuyerController } from './controller/buyer.controller';
import { AuthModule } from '../authModule/authModule';
import { DealerEntity } from './userEntity/dealerEntity';
import { DealerService } from './service/dealer.service';
import { DealerRepository } from './repository/dealer.repository';
import { DriverEntity } from './userEntity/driver.entity';
import { DealerController } from './controller/dealer.controller';
import { CloudinaryModule } from '../cloudinaryModule/cloudinary.module';
import { DriverService } from './service/driver.service';
import { DriverRepository } from './repository/driver.repository';
import { DriverController } from './controller/driver.controller';
import { DealerRepositoryMiddleware } from '../../common/middleware/dealer.repository.middleware';
import { DealerEntityRepository } from './repository/dealer.entity.repository';
import { BuyerEntityRepository } from './repository/buyer.entity.repository';
import { DriverEntityRepository } from './repository/driver.entity.repository';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { PaymentModule } from '../paymentModule/payment.module';
import { AdminEntity } from './userEntity/admin.entity';
import { AdminRepository } from './repository/admin.repository';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { AdminEntityRepository } from './repository/admin.entity.repository';
import { AccessoryDealerRepository } from './repository/accessoryDealer.repository';
import { AccessoryDealerEntity } from './userEntity/accessoryDealer.entity';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    AuditLogModule,
    CloudinaryModule,
    AuthModule,
    TypeOrmModule.forFeature([
      BuyerEntity,
      DealerEntity,
      DriverEntity,
      AdminEntity,
      AccessoryDealerEntity,
    ]),
  ],
  controllers: [
    BuyerController,
    DealerController,
    DriverController,
    AdminController,
  ],
  providers: [
    BuyerService,
    DealerService,
    DriverService,
    AdminService,
    DealerEntityRepository,
    BuyerEntityRepository,
    DriverEntityRepository,
    AdminEntityRepository,
    AccessoryDealerRepository,
    {
      provide: 'IBuyerRepository',
      useClass: BuyerRepository,
    },
    {
      provide: 'IDealerRepository',
      useClass: DealerRepository,
    },
    {
      provide: 'IDriverRepository',
      useClass: DriverRepository,
    },
    {
      provide: 'IAdminRepository',
      useClass: AdminRepository,
    },
    {
      provide: 'IAccessoryDealerRepository',
      useClass: AccessoryDealerRepository,
    },
  ],
  exports: [
    DealerEntityRepository,
    BuyerEntityRepository,
    DriverEntityRepository,
    AdminEntityRepository,
    BuyerService,
    DealerService,
    DriverService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DealerRepositoryMiddleware).forRoutes(DealerController);
  }
}
