import { Injectable, Logger } from '@nestjs/common';
import { DriverEntity } from '../userEntity/driver.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateDriverDto, UpdateDriverDto } from '../utils/user.dto';

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

  findDriverById = async (userId: string) => {
    const driver = await this.findOne({
      where: { userId },
    });
    return driver;
  };

  findDriverById2 = async (driverId: string) => {
    const driver = await this.findOne({
      where: { driverId },
    });
    return driver;
  };

  findDrivers = async (options: { skip: number; take: number }) => {
    const driversQuery = this.createQueryBuilder('drivers');

    const [drivers, total] = await driversQuery
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return { drivers, total };
  };

  updateDriver = async (driverId: string, updateDto: UpdateDriverDto) => {
    await this.update({ driverId }, updateDto);
    return await this.findOne({ where: { driverId } });
  };

  updateDriverImage = async (driverId: string, updateDto: UpdateDriverDto) => {
    await this.update({ driverId }, updateDto);
    return await this.findOne({ where: { driverId } });
  };

  deleteDriverProfile = async (driverId: string) => {
    return await this.delete({ driverId });
  };
}
