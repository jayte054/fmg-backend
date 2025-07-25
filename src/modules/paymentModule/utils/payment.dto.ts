import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
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
}
