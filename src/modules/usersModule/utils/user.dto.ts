import { IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
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
