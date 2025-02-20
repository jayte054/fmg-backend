import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { PurchaseService } from '../purchaseService/purchase.service';
import { GetBuyerDecorator } from 'src/common/decorators/getBuyerDecorator';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { CreatePurchaseCredentials } from '../utils/purchase.type';

@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Post('createPurchase')
  @HttpCode(HttpStatus.CREATED)
  async createPurchase(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Body(ValidationPipe) createPurchaseCredentials: CreatePurchaseCredentials,
  ) {
    return await this.purchaseService.createPurchase(
      buyer,
      createPurchaseCredentials,
    );
  }
}
