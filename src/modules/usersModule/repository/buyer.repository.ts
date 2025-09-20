import { DataSource, Repository } from 'typeorm';
import { BuyerEntity } from '../userEntity/buyer.entity';
import { Injectable } from '@nestjs/common';
import { CreateBuyerDto, UpdateBuyerDto } from '../utils/user.dto';
import { BuyersFilterInterface } from '../utils/user.types';
import { paginatedBuyerResponse } from '../utils/utils';

@Injectable()
export class BuyerRepository extends Repository<BuyerEntity> {
  constructor(private dataSource: DataSource) {
    super(BuyerEntity, dataSource.createEntityManager());
  }

  createBuyer = async (createBuyerDto: CreateBuyerDto) => {
    const newBuyer = this.create(createBuyerDto);
    const buyer = await newBuyer.save();
    return buyer;
  };

  findBuyerById = async (userId: string) => {
    const query = this.createQueryBuilder('buyer');
    const buyer = await query
      .where('buyer.userId = :userId', { userId })
      .getOne();
    return buyer;
  };

  findBuyers = async (filter: BuyersFilterInterface) => {
    const { search, role, createdAt, isDeleted, skip, take } = filter;
    const buyersQuery = this.createQueryBuilder('buyer');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      buyersQuery.andWhere(
        `
          LOWER(buyers.firstName) ILIKE :lowerCaseSearch
          OR LOWER(buyer.lastName) ILIKE :lowerCaseSearch
          OR LOWER(buyers.phoneNumber) ILIKE :lowerCaseSearch
          OR LOWER(buyer.email) ILIKE :lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (role) {
      buyersQuery.andWhere('buyer.role = :role', { role });
    }

    if (createdAt) {
      buyersQuery.andWhere('buyer.createdAt = :createdAt', { createdAt });
    }

    if (isDeleted) {
      buyersQuery.andWhere('buyer.isDeleted = :isDeleted', { isDeleted });
    }

    buyersQuery.orderBy('createdAt', 'DESC');

    const [buyers, total] = await buyersQuery
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedBuyerResponse({ buyers, total, skip, take });
  };

  updateBuyer = async (buyerId: string, updateDto: UpdateBuyerDto) => {
    await this.update({ buyerId }, updateDto);
    return await this.findOne({ where: { buyerId } });
  };

  deleteBuyer = async (buyerId: string) => {
    return await this.delete({ buyerId });
  };

  saveBuyer = async (buyer: BuyerEntity) => {
    return await this.save(buyer);
  };

  findBuyer = async (buyerId?: string, email?: string) => {
    const query = this.createQueryBuilder('buyer');

    if (buyerId) {
      query.andWhere('buyer.buyer = :buyerId', { buyerId });
    }

    if (email) {
      query.andWhere('buyer.email = :email', { email });
    }

    return await query.getOne();
  };
}
