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
  FindPurchaseByIdInterface,
  UpdatePurchaseCredentials,
} from '../utils/purchase.type';
import { Request } from 'express';
import { GetDriverDecorator } from 'src/common/decorators/getDriverDecorator';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';

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

  @Get('findPurchaseByBuyerId')
  @HttpCode(HttpStatus.OK)
  async findPurchaseByBuyerId(
    @Query() findPurchaseByIdInterface: FindPurchaseByIdInterface,
    @GetBuyerDecorator() { buyerId }: BuyerEntity,
  ) {
    return await this.purchaseService.findPurchasesByBuyerId({
      buyerId,
      page: findPurchaseByIdInterface.page,
      limit: findPurchaseByIdInterface.limit,
    });
  }

  @Get('findPurchaseByDriverId')
  @HttpCode(HttpStatus.OK)
  async findPurchaseByDriverId(
    @Query() findPurchaseByIdInterface: FindPurchaseByIdInterface,
    @GetDriverDecorator() { driverId }: DriverEntity,
  ) {
    return await this.purchaseService.findPurchasesByDriverId({
      driverId,
      page: findPurchaseByIdInterface.page,
      limit: findPurchaseByIdInterface.limit,
    });
  }

  @Get('findPurchaseByProductId/:productId')
  @HttpCode(HttpStatus.OK)
  async findPurchaseByProductId(
    @Param('productId') productId: string,
    @GetDealerDecorator() { dealerId }: DealerEntity,
    @Query() findPurchaseByIdInterface: FindPurchaseByIdInterface,
  ) {
    return await this.purchaseService.findPurchasesByProductId({
      productId,
      dealerId,
      page: findPurchaseByIdInterface.page,
      limit: findPurchaseByIdInterface.limit,
    });
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

  @Put('/deliverPurchase/:purchaseId')
  @HttpCode(HttpStatus.OK)
  async deliverPurchase(
    @Param('purchaseId') purchaseId: string,
    @GetDriverDecorator() { driverId }: DriverEntity,
    @Body() delivery: boolean,
  ) {
    return await this.purchaseService.deliverPurchase(
      driverId,
      purchaseId,
      delivery,
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
