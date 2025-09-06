import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CylinderType, PriceType, PurchaseType } from './purchase.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseEntity } from '../purchaseEntity/purchase.entity';

export class CreatePurchaseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  accessoryIds?: string[];

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  price: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryFee: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  priceType: PriceType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cylinder?: CylinderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purchaseType: PurchaseType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsOptional()
  location?: { latitude: number; longitude: number };

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purchaseDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  metadata: Record<string, string>;
}

export class UpdatePurchaseDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  purchaseId?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  productId?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  price?: string;
  @ApiProperty()
  @IsOptional()
  priceType?: PriceType;
  @ApiProperty()
  @IsOptional()
  cylinderType?: CylinderType;
  @ApiProperty()
  @IsOptional()
  purchaseType?: PurchaseType;
  @ApiProperty()
  @IsString()
  @IsOptional()
  buyerName?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;
  @ApiProperty()
  @IsOptional()
  location?: { latitude: number; longitude: number };
  @ApiProperty()
  @IsString()
  @IsOptional()
  purchaseDate?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  buyerId?: string;
  @ApiProperty()
  @IsOptional()
  metadata?: Record<string, string>;
}

export class FindPurchaseByIdDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dealerId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  buyerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driverId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  page: string;
  limit: string;
}

export class DeliveryPurchaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  delivery: boolean;
}

export class PurchaseResponseDto {
  @ApiProperty()
  @IsString()
  purchaseId: string;
  @ApiProperty()
  @IsString()
  productId: string;
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  accessories?: string[];
  @ApiProperty()
  @IsString()
  deliveryFee: string;
  @ApiProperty()
  @IsString()
  price: string;
  @ApiPropertyOptional()
  @IsEnum(PriceType)
  priceType: PriceType;
  @ApiPropertyOptional()
  @IsEnum(CylinderType)
  @IsOptional()
  cylinder: CylinderType;
  @ApiProperty()
  @IsEnum(PurchaseType)
  purchaseType: PurchaseType;
  @ApiProperty()
  @IsString()
  buyerName: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiPropertyOptional()
  location?: { latitude: number; longitude: number };
  @ApiProperty()
  @IsString()
  purchaseDate: string;
  @ApiProperty()
  @IsString()
  buyerId: string;
  @ApiPropertyOptional()
  metadata?: Record<string, string>;
}

export class UserNotificationResponse {
  @ApiProperty()
  @IsString()
  notificationId: string;
  @ApiPropertyOptional()
  @IsString()
  driverName?: string;
  @ApiPropertyOptional()
  @IsString()
  buyerId?: string;
  @ApiProperty()
  @IsString()
  purchaseId: string;
  @ApiPropertyOptional()
  @IsString()
  dealerId?: string;
  @ApiPropertyOptional()
  @IsString()
  productName?: string;
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  location: { latitude: number; longitude: number };
  @ApiProperty()
  @IsBoolean()
  isRead: boolean;
  @ApiProperty()
  @IsString()
  createdAt: string;
  @ApiProperty()
  metadata: Record<string, unknown>;
}

export class StandardPurchaseResponseDto {
  @ApiProperty()
  @IsObject()
  purchaseResponse: PurchaseResponseDto;
  @ApiProperty()
  @IsObject()
  driverNotificationResponse: UserNotificationResponse;
  @ApiProperty()
  @IsObject()
  userNotificationResponse: UserNotificationResponse;
}

export class CreatePurchaseCredentialsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;
  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  price: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  deliveryFee: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(CylinderType)
  cylinderType: CylinderType;
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType;
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PurchaseType)
  purchaseType: PurchaseType;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address?: string;
}

export class FindPurchasesResponseDto {
  data: PurchaseResponseDto[];
  total: number;
  currentPage: number;
}

export class PaginatedPurchaseResponseDto {
  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  data: PurchaseEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsString()
  page: string;
  @ApiProperty()
  @IsString()
  limit: string;
}

export class GenericResponse {
  @ApiProperty()
  @IsBoolean()
  Ok: boolean;
}
