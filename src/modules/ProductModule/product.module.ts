import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './productEntity/product.entity';
import { UserModule } from '../usersModule/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UserModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ProductModle {}
