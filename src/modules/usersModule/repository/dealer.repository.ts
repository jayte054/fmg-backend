import { Injectable } from '@nestjs/common';
import { DealerEntity } from '../userEntity/dealerEntity';
import { DataSource, Repository } from 'typeorm';
import { CreateDealerDto, UpdateDealerDto } from '../utils/user.dto';
import { DealersFilterInterface } from '../utils/user.types';
import { paginatedDealerResponse } from '../utils/utils';

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

  findDealerId = async (dealerId: string) => {
    const dealer = await this.findOne({
      where: { dealerId },
    });
    return dealer;
  };

  findDealers = async (filter: DealersFilterInterface) => {
    const { search, scale, verified, createdAt, skip, take } = filter;
    const dealersQuery = this.createQueryBuilder('dealer');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      dealersQuery.andWhere(
        `
          LOWER(dealer.name) ILIKE :lowerCaseSearch
          OR LOWER(dealer.email) ILIKE :email
          OR LOWER(dealer.address) ILIKE :address
        `,
        { lowerCaseSearch },
      );
    }

    if (scale) {
      dealersQuery.andWhere('dealer.scale = :scale', { scale });
    }

    if (verified) {
      dealersQuery.andWhere('dealer.verified = :verified', { verified });
    }

    if (createdAt) {
      dealersQuery.andWhere('dealer.createdAt = :createdAt', { createdAt });
    }

    dealersQuery.orderBy('dealer.createdAt', 'DESC');

    const [dealers, total] = await dealersQuery
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedDealerResponse({ dealers, total, skip, take });
  };

  updateDealer = async (dealerId: string, updateDto: UpdateDealerDto) => {
    await this.update({ dealerId }, updateDto);
    return await this.findOne({ where: { dealerId } });
  };

  deleteDealer = async (dealerId: string) => {
    return await this.delete({ dealerId });
  };
}
