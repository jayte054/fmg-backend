import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessoryEntity } from './accessoryEntity/accessoryEntity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessoryEntity])],
  providers: [],
  controllers: [],
  exports: [],
})
export class AccessoryModule {}
