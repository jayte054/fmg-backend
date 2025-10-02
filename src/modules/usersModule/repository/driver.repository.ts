import { Injectable, Logger } from '@nestjs/common';
import { DriverEntity } from '../userEntity/driver.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateDriverDto } from '../utils/user.dto';
import {
  CreateDriverInterface,
  DriverFilterInterface,
} from '../utils/user.types';
import { paginatedDriverResponse } from '../utils/utils';

@Injectable()
export class DriverRepository extends Repository<DriverEntity> {
  private logger = new Logger('DriverRepository');
  constructor(private dataSource: DataSource) {
    super(DriverEntity, dataSource.createEntityManager());
  }

  createDriver = async (createDriverDto: CreateDriverInterface) => {
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

  findDrivers = async (filter: DriverFilterInterface) => {
    const { search, createdAt, isDeleted, skip, take } = filter;
    const driversQuery = this.createQueryBuilder('drivers');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      driversQuery.andWhere(
        `
        drivers.firstName ILIKE :lowerCaseSearch
        OR drivers.lastName ILIKE :lowerCaseSearch
        OR drivers.email ILIKE :lowerCaseSearch
        OR drivers.address ILIKE :lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (createdAt) {
      driversQuery.andWhere('drivers.createdAt = :createdAt', { createdAt });
    }

    if (isDeleted) {
      driversQuery.andWhere('drivers.isDeleted = :isDeleted', { isDeleted });
    }

    driversQuery.orderBy('drivers.createdAt', 'DESC');

    const [drivers, total] = await driversQuery
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedDriverResponse({
      drivers,
      total,
      skip,
      take,
    });
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
