import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
} from 'class-validator';
import { PurchaseResponse } from '../../purchaseModule/utils/purchase.type';
import { ApiProperty } from '@nestjs/swagger';

class PurchaseCredentials {
  @ApiProperty()
  price: string;
  @ApiProperty()
  deliveryFee: string;
  @ApiProperty()
  productId: string;
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
