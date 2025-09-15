import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { PaymentService } from '../service/payment.service';
import { GetBuyerDecorator } from '../../../common/decorators/getBuyerDecorator';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import {
  BuyerPaymentResponseDto,
  InitializePaymentDto,
  PaginatedPaymentResponseDto,
  PaymentFilterDto,
  UpdateBankDetailDto,
  WithdrawalDto,
} from '../utils/payment.dto';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { ActivateSubAccountInterface } from '../utils/interface';
import { GetDriverDecorator } from 'src/common/decorators/getDriverDecorator';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';
// import { GetAdminDecorator } from 'src/common/decorators/getAdminDecorator';
// import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@ApiTags('Payment')
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initializePayment')
  @ApiOperation({ summary: 'initialize payment' })
  @ApiResponse({ status: 201, description: 'payment successfully initialized' })
  @HttpCode(HttpStatus.CREATED)
  async initiatePayment(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Body(ValidationPipe) paymentDto: InitializePaymentDto,
  ) {
    return await this.paymentService.initializePayment(buyer, paymentDto);
  }

  @Put('activateSubaccount')
  @ApiOperation({ summary: 'activate subaccount' })
  @ApiResponse({ status: 201, description: 'account activated' })
  @HttpCode(HttpStatus.OK)
  async activateSubAccount(
    @GetDealerDecorator() dealer: DealerEntity,
    // @GetAdminDecorator() admin: AdminEntity,
    @Body(ValidationPipe) subAccountInterface: ActivateSubAccountInterface,
  ) {
    return await this.paymentService.activateSubAccount(
      dealer,
      subAccountInterface,
    );
  }

  @Put('withdrawFromWallet')
  @ApiOperation({ summary: 'withdraw from wallet' })
  @ApiResponse({ status: 201, description: 'withdrawal successful' })
  @HttpCode(HttpStatus.OK)
  async withdrawFromWallet(
    @GetDriverDecorator() driver: DriverEntity,
    @Body() { amount }: WithdrawalDto,
  ) {
    return await this.paymentService.withdrawFromWallet(amount, driver);
  }

  @Put('updateBankDetail')
  @ApiOperation({ summary: 'update bank detail' })
  @ApiResponse({ status: 201, description: 'update bank details' })
  @HttpCode(HttpStatus.OK)
  async updateBankDetail(
    @GetDriverDecorator() driver: DriverEntity,
    @Body() updateBankDetailDto: UpdateBankDetailDto,
  ) {
    return await this.paymentService.updateBankDetail(
      updateBankDetailDto.accountNumber,
      updateBankDetailDto.bankName,
      updateBankDetailDto.accountName,
      driver,
    );
  }

  @Get('findPayment/:paymentId')
  @ApiOperation({ summary: 'find payment' })
  @ApiResponse({
    status: 201,
    description: 'find payment',
    type: BuyerPaymentResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findPayment(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('paymentId') paymentId: string,
  ) {
    return await this.paymentService.findPayment(buyer, paymentId);
  }

  @Get('findPayments')
  @ApiOperation({ summary: 'find Payments' })
  @ApiResponse({
    status: 201,
    description: 'find payments',
    type: PaginatedPaymentResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findPayments(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Query() paymentFilter: PaymentFilterDto,
  ) {
    return await this.paymentService.findPayments(buyer, paymentFilter);
  }
}
