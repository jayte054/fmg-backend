import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';

export class CreateAccessoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  price: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty()
  file: Express.Multer.File;
}

export class AccessoryFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dealerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  isActive?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  take?: number;
}

export class UpdateAccessoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dealerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  review?: Record<string, string>;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  metadata?: Record<string, string>;
}

export class CreateAccessoryResponse {
  @ApiProperty()
  @IsBoolean()
  success: boolean;
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsObject()
  accessory: AccessoryEntity;
}

export class SuccessAccessoryResponse {
  @ApiProperty()
  @IsNumber()
  status: number;
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  data: AccessoryEntity;
}

export class PaginatedAccessoriesClass {
  @ApiProperty()
  @IsObject()
  accessories: AccessoryEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
}

export class PaginatedAccessoriesResponse extends PaginatedAccessoriesClass {
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}

export class ToggleAccessoryResponse {
  @ApiProperty()
  @IsBoolean()
  ok: boolean;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
