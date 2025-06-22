import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { PurchaseService } from '../purchaseService/purchase.service';
import { GetBuyerDecorator } from 'src/common/decorators/getBuyerDecorator';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  CreatePurchaseCredentials,
  UpdatePurchaseCredentials,
} from '../utils/purchase.type';
import { Request } from 'express';

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
    console.log('purchase')
    return await this.purchaseService.createPurchase(
      buyer,
      createPurchaseCredentials,
    );
  }

  @Get('findPurchaseById/:purchaseId')
  @HttpCode(HttpStatus.OK)
  async findPurchaseById(
    @Param('purchaseId') purchaseId: string,
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Req() req: Request,
  ) {
    const { user }: any = req;
    return await this.purchaseService.findPurchaseById(purchaseId, buyer, user);
  }

  @Get('findPurchases')
  @HttpCode(HttpStatus.OK)
  async findPurchases(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.purchaseService.findPurchases(page, limit);
  }

  @Put('/updatePurchase/:purchaseId')
  @HttpCode(HttpStatus.OK)
  async updatePurchase(
    @Param('purchaseId') purchaseId: string,
    @GetBuyerDecorator() { buyerId }: BuyerEntity,
    @Body() updatePurchaseCredentials: UpdatePurchaseCredentials,
  ) {
    return await this.purchaseService.updatePurchase(
      buyerId,
      purchaseId,
      updatePurchaseCredentials,
    );
  }

  @Delete('/deletePurchase/:purchaseId')
  @HttpCode(HttpStatus.OK)
  async deletePurchase(
    @Param('purchaseId') purchaseId: string,
    @GetBuyerDecorator() { buyerId }: BuyerEntity,
  ) {
    return await this.purchaseService.deletePurchase(purchaseId, buyerId);
  }
}
