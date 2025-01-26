import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerEntity } from './userEntity/buyer.entity';
import { BuyerRepository } from './repository/user.repository';
import { BuyerService } from './service/user.service';
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
