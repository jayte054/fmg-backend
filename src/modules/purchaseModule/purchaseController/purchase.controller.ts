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
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { PurchaseService } from '../purchaseService/purchase.service';
import { GetBuyerDecorator } from '../../../common/decorators/getBuyerDecorator';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import {
  FindPurchaseByIdInterface,
  UpdatePurchaseCredentials,
} from '../utils/purchase.type';
import { Request } from 'express';
import { GetDriverDecorator } from '../../../common/decorators/getDriverDecorator';
import { DriverEntity } from '../../usersModule/userEntity/driver.entity';
import { GetDealerDecorator } from '../../../common/decorators/getDealerDecorator';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';
import {
  CreatePurchaseCredentialsDto,
  CreatePurchaseDto,
  DeliveryPurchaseDto,
  FindPurchaseByIdDto,
  FindPurchasesResponseDto,
  GenericResponse,
  PaginatedPurchaseResponseDto,
  PurchaseResponseDto,
  StandardPurchaseResponseDto,
} from '../utils/purchase.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DebutOrderCredentialsDto } from 'src/modules/paymentModule/utils/payment.dto';

@ApiTags('Purchase')
@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Post('createPurchase/:reference')
  @ApiOperation({ summary: 'created new purchase' })
  @ApiResponse({
    status: 201,
    description: 'user created new purchase',
    type: StandardPurchaseResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createPurchase(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('reference') reference: string,
    @Body(ValidationPipe)
    createPurchaseCredentials: CreatePurchaseCredentialsDto,
  ) {
    return await this.purchaseService.createPurchase(
      buyer,
      createPurchaseCredentials,
      reference,
    );
  }

  @Post('createDebutPurchaseOrder/:reference')
  @ApiOperation({ summary: 'created new purchase' })
  @ApiResponse({
    status: 201,
    description: 'user created new purchase',
    type: StandardPurchaseResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createdDebutPurchaseOrder(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('reference') reference: string,
    @Body(ValidationPipe) createPurchaseCredentials: DebutOrderCredentialsDto,
  ) {
    return await this.purchaseService.createDebutOrderPurchase(
      buyer,
      createPurchaseCredentials,
      reference,
    );
  }

  @Post('createAccessoryPurchase/:reference')
  @ApiOperation({ summary: 'created new accessory purchase' })
  @ApiResponse({
    status: 201,
    description: 'accessory purchase successful',
    type: StandardPurchaseResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccessoryPurchase(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('reference') reference: string,
    @Body(ValidationPipe) purchaseDto: CreatePurchaseDto,
  ) {
    return await this.purchaseService.createAccessoryPurchase(
      buyer,
      purchaseDto,
      reference,
    );
  }

  @Get('findPurchaseById/:purchaseId')
  @ApiOperation({ summary: 'fetched purchase' })
  @ApiResponse({
    status: 200,
    description: 'user fetched purchase',
    type: PurchaseResponseDto,
  })
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
  @ApiOperation({ summary: 'fetched new purchases' })
  @ApiResponse({
    status: 200,
    description: 'user fetched new purchases',
    type: FindPurchasesResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findPurchases(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.purchaseService.findPurchases(page, limit);
  }

  @Get('findPurchaseByBuyerId')
  @ApiOperation({ summary: 'buyer fetched purchases' })
  @ApiResponse({
    status: 200,
    description: 'user of type buyer fetched purchases',
    type: PaginatedPurchaseResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findPurchaseByBuyerId(
    @Query() findPurchaseByIdInterface: FindPurchaseByIdDto,
    @GetBuyerDecorator() { buyerId }: BuyerEntity,
  ) {
    return await this.purchaseService.findPurchasesByBuyerId({
      buyerId,
      page: findPurchaseByIdInterface.page,
      limit: findPurchaseByIdInterface.limit,
    });
  }

  @Get('findPurchaseByDriverId')
  @ApiOperation({ summary: 'driver fetched purchases' })
  @ApiResponse({
    status: 200,
    description: 'user of type driver fetched purchases',
    type: PaginatedPurchaseResponseDto,
  })
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
  @ApiOperation({ summary: 'dealer fetched purchases' })
  @ApiResponse({
    status: 200,
    description: 'user of type dealer fetched purchases',
    type: PaginatedPurchaseResponseDto,
  })
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
  @ApiOperation({ summary: 'update purchase' })
  @ApiResponse({
    status: 200,
    description: 'user updated purchase',
    type: PurchaseResponseDto,
  })
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

  @Put('/pickupPurchase/:purchaseId')
  @ApiOperation({ summary: 'driver picked up purchase' })
  @ApiResponse({
    status: 200,
    description: 'user of type driver picked up purchase',
    type: GenericResponse,
  })
  @HttpCode(HttpStatus.OK)
  async pickUpPurchase(
    @Param('purchaseId') purchaseId: string,
    @GetDriverDecorator() { driverId }: DriverEntity,
  ) {
    return await this.purchaseService.pickupPurchase(driverId, purchaseId);
  }

  @Put('/deliverPurchase/:purchaseId')
  @ApiOperation({ summary: 'driver delivered purchase' })
  @ApiResponse({
    status: 200,
    description: 'user of type driver delivered purchase',
    type: GenericResponse,
  })
  @HttpCode(HttpStatus.OK)
  async deliverPurchase(
    @Param('purchaseId') purchaseId: string,
    @GetDriverDecorator() { driverId }: DriverEntity,
    @Body() deliveryPurchaseDto: DeliveryPurchaseDto,
  ) {
    const { delivery, token } = deliveryPurchaseDto;
    return await this.purchaseService.deliverPurchase(
      driverId,
      purchaseId,
      token,
      delivery,
    );
  }

  @Delete('/deletePurchase/:purchaseId')
  @ApiOperation({ summary: 'deleted purchase' })
  @ApiResponse({
    status: 200,
    description: 'user deleted purchase',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async deletePurchase(
    @Param('purchaseId') purchaseId: string,
    @GetBuyerDecorator() { buyerId }: BuyerEntity,
  ) {
    return await this.purchaseService.deletePurchase(purchaseId, buyerId);
  }
}
