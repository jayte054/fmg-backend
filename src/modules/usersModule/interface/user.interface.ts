import {
  CreateBuyerDto,
  CreateSellerDto,
  UpdateBuyerDto,
  UpdateSellerDto,
} from '../utils/user.dto';
import { BuyerResponse, SellerResponse } from '../utils/user.types';

export interface IBuyerRepository {
  createBuyer(createBuyerDto: CreateBuyerDto): Promise<BuyerResponse>;
  findBuyerById(userId: string): Promise<BuyerResponse>;
  findBuyers(options: {
    skip: number;
    take: number;
  }): Promise<{ buyers: BuyerResponse[]; total: number }>;
  updateBuyer(
    buyerId: string,
    updateDto: UpdateBuyerDto,
  ): Promise<BuyerResponse>;
  deleteBuyer(buyerId: string): Promise<any>;
}

export interface ISellerRepository {
  createSeller(createSellerDto: CreateSellerDto): Promise<SellerResponse>;
  findSellerId(userId: string): Promise<SellerResponse>;
  findSellers(options: {
    skip: number;
    take: number;
  }): Promise<Promise<{ sellers: SellerResponse[]; total: number }>>;
  updateSellers(
    sellerId: string,
    sellerDto: UpdateSellerDto,
  ): Promise<SellerResponse>;
  deleteSeller(sellerId: string): Promise<any>;
}
