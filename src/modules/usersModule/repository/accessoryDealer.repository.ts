import { DataSource, Repository } from 'typeorm';
import { AccessoryDealerEntity } from '../userEntity/accessoryDealer.entity';
import { Injectable } from '@nestjs/common';
import { CreateAccDealerDto, UpdateDealerDto } from '../utils/user.dto';

@Injectable()
export class AccessoryDealerRepository extends Repository<AccessoryDealerEntity> {
  constructor(private dataSource: DataSource) {
    super(AccessoryDealerEntity, dataSource.createEntityManager());
  }

  createDealer = async (createDealerDto: CreateAccDealerDto) => {
    const newDealer = this.create(createDealerDto);
    const dealer = await newDealer.save();
    return dealer;
  };

  findDealerId = async (dealerId: string) => {
    const dealer = await this.findOne({
      where: { accDealerId: dealerId },
    });
    return dealer;
  };

  findDealers = async (options: { skip: number; take: number }) => {
    const dealersQuery = this.createQueryBuilder('dealer');

    const [dealers, total] = await dealersQuery
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return { dealers, total };
  };

  updateDealer = async (dealerId: string, updateDto: UpdateDealerDto) => {
    await this.update({ accDealerId: dealerId }, updateDto);
    return await this.findOne({ where: { accDealerId: dealerId } });
  };

  deleteDealer = async (dealerId: string) => {
    return await this.delete({ accDealerId: dealerId });
  };
}
