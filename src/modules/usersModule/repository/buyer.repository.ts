import { DataSource, Repository } from 'typeorm';
import { BuyerEntity } from '../userEntity/buyer.entity';
import { Injectable } from '@nestjs/common';
import { CreateBuyerDto, UpdateBuyerDto } from '../utils/user.dto';

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
    const buyer = await this.findOne({
      where: { userId },
    });
    return buyer;
  };

  findBuyers = async (options: { skip: number; take: number }) => {
    const buyersQuery = this.createQueryBuilder('buyer');

    const [buyers, total] = await buyersQuery
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return { buyers, total };
  };

  updateBuyer = async (buyerId: string, updateDto: UpdateBuyerDto) => {
    await this.update({ buyerId }, updateDto);
    return await this.findOne({ where: { buyerId } });
  };
}
