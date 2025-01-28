import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { SellerService } from '../service/seller.service';
import { SellerCredentials } from '../utils/user.types';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('seller')
export class SellerController {
  constructor(private sellerService: SellerService) {}

  @Post('/createSeller')
  @HttpCode(HttpStatus.CREATED)
  async createSeller(
    @Body(ValidationPipe) sellerCredentials: SellerCredentials,
    @Req() req: Request,
  ) {
    const { user }: any = req;
    return await this.sellerService.createSeller(user, sellerCredentials);
  }

  @Get('/findSellerById')
  @HttpCode(HttpStatus.OK)
  async findSellerById(@Req() req: Request) {
    const { user }: any = req;
    return await this.sellerService.findSellerById(user.id);
  }
}
