import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
} from 'class-validator';
import { PurchaseResponse } from '../../purchaseModule/utils/purchase.type';

interface PurchaseCredentials {
  price: string;
  deliveryFee: string;
  productId: string;
}

export class InitializePaymentDto {
  @IsNotEmptyObject()
  purchase: PurchaseCredentials;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsNotEmptyObject()
  purchase: PurchaseResponse;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class UpdateBankDetailDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;
}

export class WithdrawalDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
