import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseEntity } from '../purchaseEntity/purchase.entity';
import { CreatePurchaseDto } from '../utils/purchase.dto';

@Injectable()
export class PurchaseRepository extends Repository<PurchaseEntity> {
  constructor(private dataSource: DataSource) {
    super(PurchaseEntity, dataSource.createEntityManager());
  }

  createPurchase = async (createPurchaseDto: CreatePurchaseDto) => {
    const newPurchase = this.create(createPurchaseDto);
    const purchase = await newPurchase.save();
    return purchase;
  };
}
