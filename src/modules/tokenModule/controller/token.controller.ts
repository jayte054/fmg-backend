import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from '../tokenService/token.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { GetBuyerDecorator } from '../../../common/decorators/getBuyerDecorator';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';

@ApiTags('resend_token')
@UseGuards(JwtAuthGuard)
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Put('resendToken/:purchaseId')
  @ApiOperation({ summary: 'resend token' })
  @ApiResponse({
    status: 200,
    description: 'token resent successfully',
  })
  @HttpCode(HttpStatus.OK)
  async resendToken(
    @Param('purchaseId') purchaseId: string,
    @GetBuyerDecorator() { email }: BuyerEntity,
    @Body() purchaseTitle: string,
  ) {
    return this.tokenService.resendToken({
      email,
      purchaseId,
      purchaseTitle,
    });
  }
}
