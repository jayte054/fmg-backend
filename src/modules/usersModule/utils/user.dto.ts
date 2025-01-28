import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RetailScale } from './user.types';

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

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

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
