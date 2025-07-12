import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { PaymentService } from '../service/payment.service';
import { GetBuyerDecorator } from 'src/common/decorators/getBuyerDecorator';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { InitializePaymentDto } from '../utils/payment.dto';

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
    return await this.paymentService.initializePayment(buyer, paymentDto);
  }
}
