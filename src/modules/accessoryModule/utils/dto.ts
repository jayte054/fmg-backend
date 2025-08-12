import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateAccessoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumberString()
  @IsNotEmpty()
  price: string;

  @IsNumberString()
  @IsNotEmpty()
  quantity: string;
}
