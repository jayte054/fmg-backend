import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { RetailScale, VehicleType } from './user.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BuyerEntity } from '../userEntity/buyer.entity';
import { DriverEntity } from '../userEntity/driver.entity';

export class CreateBuyerDto {
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

  @IsNotEmpty()
  location: { latitude: number; longitude: number };

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;

  metadata: Record<string, string>;
}

export class UpdateBuyerDto {
  @ApiPropertyOptional()
  @IsString()
  firstName?: string;
  @ApiPropertyOptional()
  @IsString()
  lastName?: string;
  @ApiPropertyOptional()
  @IsString()
  phoneNumber?: string;
  @ApiPropertyOptional()
  @IsString()
  email?: string;
  @ApiPropertyOptional()
  @IsString()
  address?: string;
  @ApiPropertyOptional()
  location?: { latitude: number; longitude: number };
  @ApiPropertyOptional()
  @IsBoolean()
  isDeleted?: boolean;
  @ApiPropertyOptional()
  metadata?: Record<string, string>;
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

  @IsNotEmpty()
  location: { latitude: number; longitude: number };

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

  location?: { latitude: number; longitude: number };

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
  driversLicenseNumber: string;

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

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}

export interface AdminFilter {
  search: string;
  active: boolean;
  skip: number;
  take: number;
}

export interface CreateAdminCredentials {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: string;
  role: string;
  isAdmin: boolean;
  userId: string;
  metadata: Record<string, unknown>;
}

export interface UpdateFilter {
  name?: string;
  phoneNumber?: string;
  address?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export class CreateAccDealerDto {
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

  @IsNotEmpty()
  location: { latitude: number; longitude: number };

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class BuyerCredentialsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
  @ApiProperty()
  location: { latitude: number; longitude: number };
}

export class LocationDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}

export class DealerCredentialsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location: LocationDto;
  @ApiProperty()
  @IsEnum(RetailScale)
  @IsNotEmpty()
  scale: RetailScale;
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  rating: number;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankCode: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}

export class CreateDriverCredentialsDto {
  @ApiProperty({ example: 'John', description: 'Driver first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Driver last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '123 Main Street, Lagos',
    description: 'Driver address',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: VehicleType, description: 'Type of vehicle' })
  @IsEnum(VehicleType)
  vehicle: VehicleType;

  @ApiProperty({ example: 'ABC-123-XYZ', description: 'Vehicle plate number' })
  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @ApiProperty({
    example: 'DLN1234567890',
    description: 'Driver license number',
  })
  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  driversLicenseNumber: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Driver license file upload',
  })
  driversLicense: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Additional file (e.g., ID card, utility bill)',
  })
  file: Express.Multer.File;
}

export class BuyersFilterDto {
  @ApiPropertyOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional()
  @IsString()
  role?: string;
  @ApiPropertyOptional()
  createdAt?: Date;
  @ApiPropertyOptional()
  isDeleted?: boolean;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
}

export class PaginatedBuyerResponseDto {
  @ApiProperty()
  buyers: BuyerEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
  @ApiProperty()
  @IsBoolean()
  hasMore: boolean;
}

export class BuyerResponseInterfaceDto {
  @ApiProperty()
  @IsString()
  buyerId: string;
  @ApiProperty()
  @IsString()
  firstName: string;
  @ApiProperty()
  @IsString()
  lastName: string;
  @ApiProperty()
  @IsString()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  location: { latitude: number; longitude: number };
  @ApiProperty()
  @IsString()
  email: string;
  @ApiProperty()
  @IsString()
  role: string;
  @ApiProperty()
  @IsBoolean()
  isAdmin: boolean;
  @ApiProperty()
  @IsString()
  userId: string;
  @ApiProperty()
  metadata: Record<string, string>;
}

export class BuyerResponseDto {
  @ApiProperty()
  @IsNumber()
  status: number;
  @ApiProperty()
  data: BuyerResponseInterfaceDto;
}

export class DriverFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  createdAt?: Date;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class PaginatedDriversResponseDto {
  @ApiProperty()
  data: DriverEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
  @ApiProperty()
  @IsBoolean()
  hasMore: boolean;
}

export class DriverDetailsDto {
  @ApiProperty()
  @IsString()
  driverId: string;
  @ApiProperty()
  @IsString()
  firstName: string;
  @ApiProperty()
  @IsString()
  lastName: string;
  @ApiProperty()
  @IsString()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  email: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  @IsString()
  vehicle: VehicleType;
  @ApiProperty()
  @IsString()
  vehicleNumber: string;
  @ApiProperty()
  @IsString()
  role: string;
  @ApiProperty()
  @IsString()
  driversLicense: string;
  @ApiProperty()
  @IsString()
  imageUrl: string;
  @ApiProperty()
  @IsBoolean()
  isAdmin: boolean;
  @ApiProperty()
  @IsString()
  userId: string;
}

export class DriverResponseDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  data: DriverDetailsDto;
}
