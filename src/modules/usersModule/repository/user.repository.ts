import { DataSource, Repository } from 'typeorm';
import { BuyerEntity } from '../userEntity/buyer.entity';
import { Injectable } from '@nestjs/common';
import { CreateBuyerDto } from '../utils/user.dto';

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
}
