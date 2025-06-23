import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DriverEntity } from '../userEntity/driver.entity';

@Injectable()
export class DriverEntityRepository extends Repository<DriverEntity> {
  constructor(private dataSource: DataSource) {
    super(DriverEntity, dataSource.createEntityManager());
  }

  async findDriverByEmail(email: string): Promise<DriverEntity | null> {
    return this.findOne({ where: { email } });
  }
}
