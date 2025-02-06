import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DealerEntity } from '../userEntity/dealerEntity';

@Injectable()
export class DealerEntityRepository extends Repository<DealerEntity> {
  constructor(private dataSource: DataSource) {
    super(DealerEntity, dataSource.createEntityManager());
  }

  async findDealerByEmail(email: string): Promise<DealerEntity | null> {
    return this.findOne({ where: { email } });
  }
}
