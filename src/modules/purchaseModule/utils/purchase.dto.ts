import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { CylinderType, PriceType, PurchaseType } from './purchase.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cylinder: CylinderType;

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
