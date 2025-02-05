import { Injectable } from '@nestjs/common';
import { DealerEntity } from '../userEntity/dealerEntity';
import { DataSource, Repository } from 'typeorm';
import { CreateDealerDto, UpdateDealerDto } from '../utils/user.dto';

@Injectable()
export class DealerRepository extends Repository<DealerEntity> {
  constructor(private dataSource: DataSource) {
    super(DealerEntity, dataSource.createEntityManager());
  }

  createDealer = async (createDealerDto: CreateDealerDto) => {
    const newDealer = this.create(createDealerDto);
    const dealer = await newDealer.save();
    return dealer;
  };

  findDealerId = async (userId: string) => {
    const dealer = await this.findOne({
      where: { userId },
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
    await this.update({ dealerId }, updateDto);
    return await this.findOne({ where: { dealerId } });
  };

  deleteDealer = async (dealerId: string) => {
    return await this.delete({ dealerId });
  };
}
