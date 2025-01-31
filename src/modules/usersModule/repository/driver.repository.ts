import { Injectable, Logger } from '@nestjs/common';
import { DriverEntity } from '../userEntity/driver.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateDriverDto } from '../utils/user.dto';

@Injectable()
export class DriverRepository extends Repository<DriverEntity> {
  private logger = new Logger('DriverRepository');
  constructor(private dataSource: DataSource) {
    super(DriverEntity, dataSource.createEntityManager());
  }

  createDriver = async (createDriverDto: CreateDriverDto) => {
    const driver = await this.create(createDriverDto);
    const newDriver = await driver.save();
    return newDriver;
  };
}
