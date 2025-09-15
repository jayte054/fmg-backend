import { Injectable } from '@nestjs/common';
import { RevenueEntity } from '../entity/revenue.entity';
import { DataSource, Repository } from 'typeorm';
import { RevenueFilter } from '../utils/interface';
import { paginatedRevenue } from '../utils/utils';

@Injectable()
export class RevenueRepository extends Repository<RevenueEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RevenueEntity, dataSource.createEntityManager());
  }

  createRevenue = async (input: Partial<RevenueEntity>) => {
    const newRevenue = this.create(input);
    const revenue = await this.save(newRevenue);
    return revenue;
  };

  fetchRevenues = async (filter: RevenueFilter) => {
    const { search, isReversed, recordedAt, skip, take } = filter;
    const query = this.createQueryBuilder('revenue');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(`LOWER(revenue.reference) LIKE :reference`, {
        reference: lowerCaseSearch,
      });
    }

    if (typeof isReversed === 'boolean') {
      query.andWhere('revenue.isReversed = :isReversed', { isReversed });
    }

    if (recordedAt) {
      query.andWhere('DATE(revenue.recordedAt) = :recordedAt', {
        recordedAt,
      });
    }

    query.orderBy('revenue.recordedAt', 'DESC');

    const [revenues, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return await paginatedRevenue({
      revenues,
      total,
      skip,
      take,
    });
  };

  fetchRevenue = async (revenueId: string) => {
    return await this.findOne({ where: { revenueId } });
  };

  getTotalRevenue = async () => {
    const { sum } = await this.createQueryBuilder('revenue')
      .select('SUM(CAST(revenue.amount AS numeric))', 'sum')
      .where('revenue.isReversed = :isReversed', { isReversed: false })
      .getRawOne();

    return { totalRevenue: sum ? parseFloat(sum) : 0 };
  };
}
