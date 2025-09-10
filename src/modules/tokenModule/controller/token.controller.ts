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
import { GetDriverDecorator } from 'src/common/decorators/getDriverDecorator';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';

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
    @GetDriverDecorator() { email }: DriverEntity,
    @Body() purchaseTitle: string,
  ) {
    return this.tokenService.resendToken({
      email,
      purchaseId,
      purchaseTitle,
    });
  }
}
