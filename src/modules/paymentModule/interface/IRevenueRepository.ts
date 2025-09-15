import { RevenueEntity } from '../entity/revenue.entity';
import { PaginatedRevenueResponse, RevenueFilter } from '../utils/interface';

export interface IRevenueRepository {
  createRevenue(input: Partial<RevenueEntity>): Promise<RevenueEntity>;
  fetchRevenues(filter: RevenueFilter): Promise<PaginatedRevenueResponse>;
  fetchRevenue(revenueId: string): Promise<RevenueEntity>;
  getTotalRevenue(): Promise<{ totalRevenue: number }>;
}
