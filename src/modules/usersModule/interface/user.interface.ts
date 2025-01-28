import {
  CreateBuyerDto,
  CreateSellerDto,
  UpdateBuyerDto,
} from '../utils/user.dto';
import { BuyerResponse, SellerResponse } from '../utils/user.types';

export interface IBuyerRepository {
  createBuyer(createBuyerDto: CreateBuyerDto): Promise<BuyerResponse>;
  findBuyerById(userId: string): Promise<BuyerResponse>;
  findBuyers(options: {
    skip: number;
    take: number;
  }): Promise<{ data: BuyerResponse[]; total: number; currentPage: number }>;
  updateBuyer(
    buyerId: string,
    updateDto: UpdateBuyerDto,
  ): Promise<BuyerResponse>;
  deleteBuyer(buyerId: string): Promise<any>;
}

export interface ISellerRepository {
  createSeller(createSellerDto: CreateSellerDto): Promise<SellerResponse>;
  findSellerId(userId: string): Promise<SellerResponse>;
}
