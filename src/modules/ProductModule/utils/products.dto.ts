import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RetailScale } from '../../usersModule/utils/user.types';
import { DriverDetails, Reviewers } from './products.type';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  providerName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(RetailScale)
  scale: RetailScale;

  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Type(() => Number)
  pricePerKg: number;

  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Type(() => Number)
  rating: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  location: { latitude: number; longitude: number };

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  linkedDrivers: DriverDetails[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  reviews: Reviewers[];

  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  purchases: number;

  @IsNotEmpty()
  @IsString()
  dealerId: string;

  @IsNotEmpty()
  @IsJSON()
  metadata: Record<string, string | boolean>;
}

export class UpdateProductDto {
  productId?: string;
  providerName?: string;
  phoneNumber?: string;
  scale?: RetailScale;
  pricePerKg?: number;
  rating?: number;
  address?: string;
  location?: { latitude: number; longitude: number };
  linkedDrivers?: DriverDetails[];
  reviews?: Reviewers[];
  purchases?: number;
  dealerId?: string;
}

export class CreateProductCredentialsDto {
  @ApiProperty()
  @IsNumber()
  pricePerKg: number;
  @ApiProperty()
  @IsBoolean()
  supportsDebutOrder: boolean;
  @ApiProperty()
  @IsBoolean()
  supportsSwapOrder: boolean;
  @ApiProperty()
  @IsBoolean()
  supportsCommissionOrder: boolean;
}

export class FindProductsFilterDto {
  @ApiPropertyOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional()
  @IsString()
  price?: string;
  @ApiPropertyOptional()
  @IsEnum(RetailScale)
  scale?: RetailScale;
  @ApiPropertyOptional()
  @IsString()
  createdAt?: string;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class ProductResponseDto {
  @ApiProperty()
  @IsString()
  productId: string;
  @ApiProperty()
  @IsString()
  providerName: string;
  @ApiProperty()
  @IsString()
  phoneNumber: string;
  @ApiProperty()
  @IsEnum(RetailScale)
  scale: RetailScale;
  @ApiProperty()
  @IsNumber()
  pricePerKg: number;
  @ApiProperty()
  @IsNumber()
  rating: number;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiPropertyOptional()
  location: { latitude: number; longitude: number };
  @ApiProperty()
  linkedDrivers: DriverDetails[];
  @ApiPropertyOptional()
  reviews: Reviewers[];
  @ApiProperty()
  @IsNumber()
  purchases: number;
  @ApiProperty()
  @IsString()
  dealerId: string;
}

export class ProductsResponseDto {
  @ApiProperty()
  data: ProductResponseDto[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  currentPage: number;
}
