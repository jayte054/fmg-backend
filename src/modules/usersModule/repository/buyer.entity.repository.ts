import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BuyerEntity } from '../userEntity/buyer.entity';

@Injectable()
export class BuyerEntityRepository extends Repository<BuyerEntity> {
  constructor(private dataSource: DataSource) {
    super(BuyerEntity, dataSource.createEntityManager());
  }

  async findBuyerByEmail(email: string): Promise<BuyerEntity | null> {
    return this.findOne({ where: { email } });
  }
}
