import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerEntity } from './userEntity/buyer.entity';
import { BuyerRepository } from './repository/buyer.repository';
import { BuyerService } from './service/buyer.service';
import { UserController } from './controller/buyer.controller';
import { AuthModule } from '../authModule/authModule';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([BuyerEntity])],
  controllers: [UserController],
  providers: [
    BuyerService,
    {
      provide: 'IBuyerRepository',
      useClass: BuyerRepository,
    },
  ],
  exports: [],
})
export class UserModule {}
