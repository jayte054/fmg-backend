import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RetailScale } from 'src/modules/usersModule/utils/user.types';
import { DriversArray, Reviewers } from './products.type';
import { Type } from 'class-transformer';

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
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  linkedDriversId: DriversArray[];

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
}
