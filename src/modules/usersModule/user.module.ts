import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerEntity } from './userEntity/buyer.entity';
import { BuyerRepository } from './repository/buyer.repository';
import { BuyerService } from './service/buyer.service';
import { BuyerController } from './controller/buyer.controller';
import { AuthModule } from '../authModule/authModule';
import { SellerEntity } from './userEntity/sellerEntity';
import { SellerService } from './service/seller.service';
import { SellerRepository } from './repository/seller.repository';
import { DriverEntity } from './userEntity/driver.entity';
import { SellerController } from './controller/seller.controller';
import { CloudinaryModule } from '../cloudinaryModule/cloudinary.module';
import { DriverService } from './service/driver.service';
import { DriverRepository } from './repository/driver.repository';
import { DriverController } from './controller/driver.controller';

@Module({
  imports: [
    CloudinaryModule,
    AuthModule,
    TypeOrmModule.forFeature([BuyerEntity, SellerEntity, DriverEntity]),
  ],
  controllers: [BuyerController, SellerController, DriverController],
  providers: [
    BuyerService,
    SellerService,
    DriverService,
    {
      provide: 'IBuyerRepository',
      useClass: BuyerRepository,
    },
    {
      provide: 'ISellerRepository',
      useClass: SellerRepository,
    },
    {
      provide: 'IDriverRepository',
      useClass: DriverRepository,
    },
  ],
  exports: [],
})
export class UserModule {}
