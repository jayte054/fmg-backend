import {
  CreateBuyerDto,
  CreateDriverDto,
  CreateDealerDto,
  UpdateBuyerDto,
  UpdateDriverDto,
  UpdateDealerDto,
} from '../utils/user.dto';
import {
  BuyerResponse,
  driverResObj,
  DriverResponse,
  DealerResponse,
} from '../utils/user.types';

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

export interface IDealerRepository {
  createDealer(createDealerDto: CreateDealerDto): Promise<DealerResponse>;
  findDealerId(dealerId: string): Promise<DealerResponse>;
  findDealers(options: {
    skip: number;
    take: number;
  }): Promise<Promise<{ dealers: DealerResponse[]; total: number }>>;
  updateDealer(
    dealerId: string,
    dealerDto: UpdateDealerDto,
  ): Promise<DealerResponse>;
  deleteDealer(dealerId: string): Promise<any>;
}

export interface IDriverRepository {
  createDriver(createDriverDto: CreateDriverDto): Promise<DriverResponse>;
  findDriverById(userId: string): Promise<DriverResponse>;
  findDrivers(options: { skip: number; take: number }): Promise<driverResObj>;
  findDriverById2(driverId: string): Promise<DriverResponse>;
  updateDriver(
    driverId: string,
    updateDto: UpdateDriverDto,
  ): Promise<DriverResponse>;
  updateDriverImage(
    driverId: string,
    updateDto: UpdateDriverDto,
  ): Promise<DriverResponse>;
  deleteDriverProfile(driverId: string): Promise<any>;
}
