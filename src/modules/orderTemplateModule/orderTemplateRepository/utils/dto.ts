import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CylinderType,
  PriceType,
  PurchaseType,
} from 'src/modules/purchaseModule/utils/purchase.type';

export class OrderTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accessoryIds?: string[];
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PriceType })
  priceType: PriceType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: CylinderType })
  @IsOptional()
  cylinder?: CylinderType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
  @ApiPropertyOptional()
  @IsOptional()
  location?: { latitude: number; longitude: number };
}

export class TemplateFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @Optional()
  productId?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buyerId?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  createdAt: string;
  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  skip?: number;
  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  take?: number;
}

export class TemplateResponseDto {
  @ApiProperty()
  @IsString()
  productId: string;
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accessoryIds?: string[];
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PriceType })
  priceType: PriceType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: CylinderType })
  @IsOptional()
  cylinder?: CylinderType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
  @ApiPropertyOptional()
  @IsOptional()
  location?: { latitude: number; longitude: number };
}

export class PaginatedTemplateResponseDto {
  @ApiProperty()
  @IsArray()
  templates: TemplateResponseDto[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}
