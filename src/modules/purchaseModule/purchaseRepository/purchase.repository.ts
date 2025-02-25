import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseEntity } from '../purchaseEntity/purchase.entity';
import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';

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

  findPurchaseById = async (purchaseId: string) => {
    const product = await this.findOne({ where: { purchaseId } });
    return product;
  };

  findPurchases = async (options: { skip: number; take: number }) => {
    const purchaseQuery = this.createQueryBuilder('purchases');

    const [purchases, total] = await purchaseQuery
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return { purchases, total };
  };

  updatePurchase = async (
    purchaseId: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ) => {
    const updateResult = await this.update({ purchaseId }, updatePurchaseDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
    }

    return await this.findOne({ where: { purchaseId } });
  };
}
