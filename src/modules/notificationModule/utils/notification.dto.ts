import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PushNotificationDto {
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  dealerId: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  location?: { [key: string]: unknown };

  @IsString()
  metadata?: Record<string, string>;
}

export class UserPushNotificationDto {
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  driverName: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  location: { [key: string]: unknown };

  @IsString()
  metadata?: any;
}

export interface TokenNotificationInterface {
  email: string;
  token: string;
  expiration: string;
  purchaseTitle: string;
}
