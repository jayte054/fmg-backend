import { DataSource, Repository } from 'typeorm';
import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccessoryFilter, CreateAccessoryInput } from '../utils/types';
import { paginatedAccessories } from '../utils/utils';

@Injectable()
export class AccessoryRepository extends Repository<AccessoryEntity> {
  private readonly logger = new Logger(AccessoryRepository.name);

  constructor(private dataSource: DataSource) {
    super(AccessoryEntity, dataSource.createEntityManager());
  }

  createAccessory = async (createAccessoryInput: CreateAccessoryInput) => {
    const newAccessory = this.create(createAccessoryInput);
    const accessory = await this.save(newAccessory);
    return accessory;
  };

  findAccessoryById = async (accessoryId: string) => {
    const query = this.createQueryBuilder('accessory');

    query.where('accessory.accessoryId = :accessoryId', { accessoryId });

    return await query.getOne();
  };

  findAccessories = async (filter: AccessoryFilter) => {
    const { dealerId, search, isActive, rating, skip, take } = filter;
    const query = this.createQueryBuilder('accessory');

    if (dealerId) {
      query.andWhere('accessory.dealerId = :dealerId', { dealerId });
    }

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(`LOWER(accessory.title) ILIKE :lowerCaseSearch`, {
        lowerCaseSearch,
      });
    }

    if (isActive !== undefined) {
      query.andWhere('accessory.isActive = :isActive', { isActive });
    }

    if (rating) {
      query.andWhere('accessory.rating = :rating', { rating });
    }

    const [accessories, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedAccessories({ accessories, total, skip, take });
  };

  updateAccessory = async (
    accessoryId: string,
    updateAccessoryInput: Partial<AccessoryEntity>,
  ) => {
    const response = await this.update({ accessoryId }, updateAccessoryInput);
    if (response.affected === 0)
      throw new NotFoundException('accessory not found');
    return await this.findOne({ where: { accessoryId } });
  };

  deleteAccessory = async (accessoryId: string) => {
    return await this.delete({ accessoryId });
  };

  toggleAccessoryStatus = async (accessoryId: string) => {
    const accessory = await this.findOne({ where: { accessoryId } });

    if (!accessory) {
      throw new Error(`accessory with id ${accessoryId} not found`);
    }
    const prev = accessory.isActive;
    accessory.isActive = !prev;

    await this.save(accessory);
    return { ok: true, isActive: accessory.isActive };
  };
}
