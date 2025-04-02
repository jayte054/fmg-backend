import { IsNotEmpty, IsString } from 'class-validator';

export class PushNotificationDto {
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  metadata?: any;
}
