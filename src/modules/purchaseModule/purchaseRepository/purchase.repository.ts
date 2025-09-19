import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseEntity } from '../purchaseEntity/purchase.entity';
import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';
import { PurchaseFilterInterface } from '../utils/purchase.type';

@Injectable()
export class PurchaseRepository extends Repository<PurchaseEntity> {
  constructor(private dataSource: DataSource) {
    super(PurchaseEntity, dataSource.createEntityManager());
  }

  createPurchase = async (createPurchaseDto: CreatePurchaseDto) => {
    const newPurchase = this.create(createPurchaseDto);
    const purchase = await this.save(newPurchase);
    return purchase;
  };

  findPurchaseById = async (purchaseId: string) => {
    const product = await this.findOne({ where: { purchaseId } });
    return product;
  };

  find = async () => await this.find();

  getPurchaseStats = async () => {
    const result = await this.createQueryBuilder('purchase')
      .select(
        `SUM(1 + COALESCE(CARDINALITY(purchase."accessoryIds"), 0))`,
        'totalPurchases',
      )
      .addSelect('SUM(CAST(purchase.price AS NUMERIC))', 'totalSpent')
      .addSelect(
        'SUM(CAST(purchase."deliveryFee" AS NUMERIC))',
        'totalDeliverySpent',
      )
      .getRawOne();

    return {
      totalPurchases: Number(result.totalPurchases) || 0,
      totalSpent: Number(result.totalSpent) || 0,
      totalDeliverySpent: Number(result.totalDeliverySpent) || 0,
    };
  };

  findRawPurchases = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const take = Math.max(limit, 1);
    const purchases = await this.findAndCount({
      skip,
      take,
      order: { purchaseDate: 'DESC' },
    });
    return {
      data: purchases[0],
      total: purchases[1],
      page,
      limit,
    };
  };

  findPurchases = async (purchaseFilter: PurchaseFilterInterface) => {
    const {
      search,
      priceType,
      cylinder,
      purchaseType,
      purchaseDate,
      skip,
      take,
    } = purchaseFilter;
    const purchaseQuery = this.createQueryBuilder('purchases');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase}%`;
      purchaseQuery.andWhere(
        `
        LOWER(purchases.buyerName) ILIKE :lowerCaseSearch
        OR LOWER(purchases.address) ILIKE :lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (priceType) {
      purchaseQuery.andWhere('purchases.priceType = :priceType', {
        priceType,
      });
    }

    if (cylinder) {
      purchaseQuery.andWhere('purchases.cylinder = :cylinder', {
        cylinder,
      });
    }

    if (purchaseType) {
      purchaseQuery.andWhere('purchases.purchaseType = :purchaseType', {
        purchaseType,
      });
    }

    if (purchaseDate) {
      purchaseQuery.andWhere('purchases.purchaseDate = :purchaseDate', {
        purchaseDate,
      });
    }

    purchaseQuery.orderBy('purchases', 'DESC');

    const [purchases, total] = await purchaseQuery
      .skip(skip)
      .take(take)
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

  deletePurchase = async (purchaseId: string) => {
    await this.delete({ purchaseId });
    return 'purchase deleted successfully';
  };
}
