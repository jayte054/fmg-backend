import { IsNotEmpty, IsString } from 'class-validator';
import { CylinderType, PriceType, PurchaseType } from './purchase.type';

export class CreatePurchaseDto {
  // @IsString()
  // @IsNotEmpty()
  // purchaseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty()
  priceType: PriceType;

  @IsString()
  @IsNotEmpty()
  cylinder: CylinderType;

  @IsString()
  @IsNotEmpty()
  purchaseType: PurchaseType;

  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  location?: { latitude: number; longitude: number };

  @IsString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;
}

export class UpdatePurchaseDto {
  purchaseId?: string;
  productId?: string;
  price?: string;
  priceType?: PriceType;
  cylinderType?: CylinderType;
  purchaseType?: PurchaseType;
  buyerName?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  purchaseDate?: string;
  buyerId?: string;
}
