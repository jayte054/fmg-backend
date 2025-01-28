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

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([BuyerEntity, SellerEntity])],
  controllers: [BuyerController],
  providers: [
    BuyerService,
    SellerService,
    {
      provide: 'IBuyerRepository',
      useClass: BuyerRepository,
    },
    {
      provide: 'ISellerRepository',
      useClass: SellerRepository,
    },
  ],
  exports: [],
})
export class UserModule {}
