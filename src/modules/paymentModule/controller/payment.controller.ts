import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { PaymentService } from '../service/payment.service';
import { GetBuyerDecorator } from '../../../common/decorators/getBuyerDecorator';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import { InitializePaymentDto } from '../utils/payment.dto';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { ActivateSubAccountInterface } from '../utils/interface';
import { GetDriverDecorator } from 'src/common/decorators/getDriverDecorator';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';
// import { GetAdminDecorator } from 'src/common/decorators/getAdminDecorator';
// import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@ApiTags('Purchase')
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
    console.log(paymentDto);
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
    @Body() amount: string,
  ) {
    return await this.paymentService.withdrawFromWallet(
      parseFloat(amount),
      driver,
    );
  }
}
