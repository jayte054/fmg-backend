import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
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
}

export class TemplateFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
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
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  skip?: number;
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
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

export class FindOrderTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}

export class UpdateInputDto {
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PriceType })
  priceType: PriceType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: CylinderType })
  cylinderType: CylinderType;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  location: { latitude: number; longitude: number };
  @ApiProperty()
  metadata: Record<string, unknown>;
}

export class SuccessfulResponse<T> {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsNumber()
  status: number;
  @ApiProperty()
  data: T;
}
