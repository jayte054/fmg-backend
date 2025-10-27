import {
  IsArray,
  IsBoolean,
  IsDate,
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
import { PaymentStatus, RevenueSource } from './interface';
import { PaymentEntity } from '../entity/payment.entity';
import { RevenueEntity } from '../entity/revenue.entity';
import { CashbackWalletEntity } from '../entity/cashback.entity';
import { WalletEntity } from '../entity/wallet.entity';

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

export class UpdatePaymentDto {
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
  @ApiProperty()
  @IsEnum(RevenueSource)
  source: RevenueSource;
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

export class BuyerPaymentResponseDto {
  @ApiProperty()
  @IsString()
  paymentId: string;
  @ApiProperty()
  @IsString()
  email: string;
  @ApiProperty()
  @IsString()
  purchaseId: string;
  @ApiProperty()
  @IsString()
  reference: string;
  @ApiProperty()
  @IsNumber()
  amount: number;
  @ApiProperty()
  @IsNumber()
  productAmount: number;
  @ApiProperty()
  @IsNumber()
  deliveryFee: number;
  @ApiProperty()
  @IsEnum({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;
  @ApiProperty()
  @IsString()
  createdAt: string;
  @ApiProperty()
  metadata?: Record<string, string>;
}

export class PaymentFilterDto {
  @ApiProperty()
  @IsString()
  userId: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdAt?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class AdminPaymentFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class PaginatedPaymentResponseDto {
  @ApiProperty()
  @IsArray()
  payments: PaymentEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}

export class RevenueFilterDto {
  @ApiProperty()
  @IsString()
  search?: string;
  @ApiProperty()
  @IsBoolean()
  isReversed?: boolean;
  @ApiProperty()
  @IsDate()
  recordedAt?: Date;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class PaginatedRevenueResponseDto {
  @ApiProperty()
  revenues: RevenueEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}

export class TotalRevenueDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsNumber()
  data: number;
}

export class RevenueResponseDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  data: RevenueEntity;
}

export class CashbackWalletFilterDto {
  @ApiPropertyOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional()
  @IsString()
  balance?: string;
  @ApiPropertyOptional()
  createdAt?: Date;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiProperty()
  @IsNumber()
  take: number;
}

export class CashbackWalletStatsResponseDto {
  @ApiProperty()
  @IsNumber()
  totalWallets: number;
  @ApiProperty()
  @IsNumber()
  activeWallet: number;
  @ApiProperty()
  @IsNumber()
  totalBalance: number;
  @ApiProperty()
  @IsNumber()
  averageBalance: number;
}

export class PaginatedCashbackWalletResponseDto {
  @ApiProperty()
  wallets: CashbackWalletEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}

export class WalletStatsResponseDto {
  @ApiProperty()
  @IsNumber()
  totalWallets: number;
  @ApiProperty()
  @IsNumber()
  activeWallet: number;
  @ApiProperty()
  @IsNumber()
  totalBalance: number;
  @ApiProperty()
  @IsNumber()
  averageBalance: number;
}

export class BuyerWalletResponseDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsString()
  status: number;
  @ApiProperty()
  @IsString()
  wallet: WalletEntity;
}

export class WalletResponseDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsNumber()
  status: number;
  @ApiProperty()
  data: WalletEntity;
}

export class WalletsResponseDto {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsNumber()
  status: number;
  @ApiProperty()
  data: WalletEntity;
}
