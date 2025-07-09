import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
import { PurchaseResponse } from 'src/modules/purchaseModule/utils/purchase.type';

export class InitializePaymentDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmptyObject()
  purchase: PurchaseResponse;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsNotEmptyObject()
  purchase: PurchaseResponse;
}
