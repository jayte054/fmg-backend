import { Injectable } from '@nestjs/common';
import { SellerEntity } from '../userEntity/sellerEntity';
import { DataSource, Repository } from 'typeorm';
import { CreateSellerDto } from '../utils/user.dto';

@Injectable()
export class SellerRepository extends Repository<SellerEntity> {
  constructor(private dataSource: DataSource) {
    super(SellerEntity, dataSource.createEntityManager());
  }

  createSeller = async (createSellerDto: CreateSellerDto) => {
    const newSeller = this.create(createSellerDto);
    const seller = await newSeller.save();
    return seller;
  };

  findSellerId = async (userId: string) => {
    const seller = await this.findOne({
      where: { userId },
    });
    return seller;
  };
}
