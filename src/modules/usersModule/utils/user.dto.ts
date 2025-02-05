import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RetailScale, VehicleType } from './user.types';

export class CreateBuyerDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateBuyerDto {
  buyerId?: string;

  firstName?: string;

  lastName?: string;

  phoneNumber?: string;

  email?: string;

  address?: string;

  location?: string;

  role?: string;

  isAdmin?: boolean;

  userId?: string;
}

export class CreateDealerDto {
  @IsString()
  @IsNotEmpty()
  dealerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @IsString()
  @IsNotEmpty()
  scale: RetailScale;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export interface UpdateDealerDto {
  dealerId?: string;

  name?: string;

  phoneNumber?: string;

  email?: string;

  address?: string;

  location?: string;

  role?: string;

  isAdmin?: boolean;

  scale?: RetailScale;

  rating?: number;

  userId?: string;
}

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  vehicle: VehicleType;

  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  driversLicense: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateDriverDto {
  driverId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  vehicle?: VehicleType;
  vehicleNumber?: string;
  role?: string;
  driversLicense?: string;
  imageUrl?: string;
  isAdmin?: boolean;
  userId?: string;
}
