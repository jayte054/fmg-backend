import { AdminEntity } from '../userEntity/admin.entity';
import { BuyerEntity } from '../userEntity/buyer.entity';
import {
  CreateBuyerDto,
  CreateDriverDto,
  CreateDealerDto,
  UpdateDriverDto,
  UpdateDealerDto,
  CreateAdminDto,
  AdminFilter,
  UpdateFilter,
  CreateAccDealerDto,
} from '../utils/user.dto';
import {
  DealerResponse,
  AdminResponse,
  AccDealerResponse,
  PaginatedBuyerResponseInterface,
  BuyerResponseInterface,
  UpdateBuyerInterface,
  PaginatedDriversResponse,
  DriverFilterInterface,
  DriverDetails,
} from '../utils/user.types';

export interface IBuyerRepository {
  createBuyer(createBuyerDto: CreateBuyerDto): Promise<BuyerResponseInterface>;
  findBuyerById(userId: string): Promise<BuyerResponseInterface>;
  findBuyers(options: {
    skip: number;
    take: number;
  }): Promise<PaginatedBuyerResponseInterface>;
  updateBuyer(
    buyerId: string,
    updateDto: UpdateBuyerInterface,
  ): Promise<BuyerResponseInterface>;
  deleteBuyer(buyerId: string): Promise<any>;
  saveBuyer(buyer: BuyerEntity): Promise<BuyerResponseInterface>;
  findBuyer(buyerId?: string, email?: string): Promise<BuyerEntity>;
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
  createDriver(createDriverDto: CreateDriverDto): Promise<DriverDetails>;
  findDriverById(userId: string): Promise<DriverDetails>;
  findDrivers(filter: DriverFilterInterface): Promise<PaginatedDriversResponse>;
  findDriverById2(driverId: string): Promise<DriverDetails>;
  updateDriver(
    driverId: string,
    updateDto: UpdateDriverDto,
  ): Promise<DriverDetails>;
  updateDriverImage(
    driverId: string,
    updateDto: UpdateDriverDto,
  ): Promise<DriverDetails>;
  deleteDriverProfile(driverId: string): Promise<any>;
}

export interface IAdminRepository {
  createAdmin(input: CreateAdminDto): Promise<AdminEntity>;
  findAdmins(filter: AdminFilter): Promise<AdminResponse>;
  findAdminByUserId(userId?: string): Promise<AdminEntity>;
  findAdmin(adminId: string): Promise<AdminEntity>;
  updateAdmin(userId: string, data: UpdateFilter);
}

export interface IAccessoryDealerRepository {
  createDealer(createDealerDto: CreateAccDealerDto): Promise<AccDealerResponse>;
  findDealerId(dealerId: string): Promise<AccDealerResponse>;
  findDealers(options: {
    skip: number;
    take: number;
  }): Promise<Promise<{ dealers: AccDealerResponse[]; total: number }>>;
  updateDealer(
    dealerId: string,
    dealerDto: UpdateDealerDto,
  ): Promise<AccDealerResponse>;
  deleteDealer(dealerId: string): Promise<any>;
}
