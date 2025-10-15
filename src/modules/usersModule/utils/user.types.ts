import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminEntity } from '../userEntity/admin.entity';
import { BuyerEntity } from '../userEntity/buyer.entity';
import { DriverEntity } from '../userEntity/driver.entity';
import { DealerEntity } from '../userEntity/dealerEntity';

export interface BuyerResponse {
  status: number;
  data: BuyerResponseInterface;
}

export interface BuyerResponseInterface {
  buyerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  location: { latitude: number; longitude: number };
  email: string;
  role: string;
  isAdmin: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: string;
  metadata: Record<string, string>;
}

export interface BuyerCredentials {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isAdmin: boolean;
  address: string;
  location: { latitude: number; longitude: number };
}

export interface Usertype {
  id: string;
  email: string;
  isAdmin: boolean;
  phoneNumber: string;
  role: string;
  iat: any;
  exp: any;
}

export enum RetailScale {
  Bulk = 'Bulk-Scale',
  Large = 'Large-Scale',
  Medium = 'Medium-Scale',
  Small = 'Small-Scale',
}

export interface DealerResponse {
  dealerId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: { latitude: number; longitude: number };
  role: string;
  isAdmin: boolean;
  scale: RetailScale;
  rating: number;
  userId: string;
}

export interface DealerCredentials {
  name: string;
  phoneNumber: string;
  address: string;
  location: { latitude: number; longitude: number };
  scale: RetailScale;
  rating: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
}

export interface DealerResObj {
  dealers: DealerResponse[];
  total: number;
}

export interface AccDealerResObj {
  dealers: AccDealerResponse[];
  total: number;
}

export interface buyerResObj {
  buyers: BuyerResponse[];
  total: number;
}

export interface UpdateCredentials {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  scale?: RetailScale;
}

export enum VehicleType {
  tricycle = 'tricycle',
  truck = 'truck',
  van = 'van',
}

export interface DriverDetails {
  driverId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  vehicle: VehicleType;
  vehicleNumber: string;
  role: string;
  driversLicense: string;
  imageUrl: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  userId: string;
}

export interface DriverResponse {
  message: string;
  data: DriverDetails;
}

export class CreateDriverCredentials {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  vehicle: VehicleType;

  @ApiProperty()
  vehicleNumber: string;

  @ApiProperty()
  driversLicenseNumber: string;

  @ApiProperty()
  driversLicense: Express.Multer.File;

  @ApiProperty()
  file: Express.Multer.File;
}

export interface CreateDriverInterface {
  driverId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  vehicle: VehicleType;
  vehicleNumber: string;
  driversLicenseNumber: string;
  role: string;
  driversLicense: string;
  imageUrl: string;
  isAdmin: boolean;
  userId: string;
  metadata: Record<string, unknown>;
}

export interface driverResObj {
  drivers: DriverResponse[];
  total: number;
}

export class UpdateDriverCredentials {
  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  vehicle?: VehicleType;

  @ApiPropertyOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional()
  driversLicense?: Express.Multer.File;
}

export interface AdminResponse {
  admins: AdminEntity[];
  total: number;
}

export interface AccDealerResponse {
  dealerId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: { latitude: number; longitude: number };
  role: string;
  isAdmin: boolean;
  rating: number;
  userId: string;
}

export interface BuyersFilterInterface {
  search?: string;
  role?: string;
  createdAt?: Date;
  isDeleted?: boolean;
  skip: number;
  take: number;
}

export interface PaginatedBuyerInterface {
  buyers: BuyerEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedBuyerResponseInterface {
  buyers: BuyerEntity[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface UpdateBuyerInterface {
  buyerId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  role?: string;
  isAdmin?: boolean;
  userId?: string;
  isDeleted?: boolean;
  metadata?: Record<string, string>;
}

export interface DriverFilterInterface {
  search: string;
  createdAt?: Date;
  isDeleted?: boolean;
  skip: number;
  take: number;
}

export interface PaginatedDriverResponseInterface {
  drivers: DriverEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedDriversResponse {
  data: DriverEntity[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface DealersFilterInterface {
  search?: string;
  scale?: RetailScale;
  createdAt?: Date;
  verified?: boolean;
  skip: number;
  take: number;
}

export interface PaginatedDealersResponseInterface {
  dealers: DealerEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedDealerResponse {
  dealers: DealerEntity[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface UserResponseInterface<T> {
  message: string;
  status: number;
  data: T;
}

export interface UsersResponseInterface<T> {
  message: string;
  status: number;
  data: PaginatedUserResponseInterface<T>;
}

export interface PaginatedUserResponseInterface<T> {
  buyers: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
