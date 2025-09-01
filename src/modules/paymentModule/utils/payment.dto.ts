import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CylinderType,
  PriceType,
  PurchaseResponse,
  PurchaseType,
} from '../../purchaseModule/utils/purchase.type';
import {
  ApiProperty,
  ApiPropertyOptional,
  // ApiPropertyOptional
} from '@nestjs/swagger';

class PurchaseCredentials {
  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsString()
  deliveryFee: string;

  @ApiPropertyOptional()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  accessoryIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accessoryId?: string;
}

export class InitializePaymentDto {
  @ApiProperty()
  @IsNotEmptyObject()
  purchase: PurchaseCredentials;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty()
  @IsNotEmptyObject()
  purchase: PurchaseResponse;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class UpdateBankDetailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;
}

export class WithdrawalDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class DebutOrderCredentialsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessoryIds?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryFee: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum({ type: CylinderType })
  cylinderType: CylinderType;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum({ type: PriceType })
  priceType: PriceType;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum({ type: PurchaseType })
  purchaseType: PurchaseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
