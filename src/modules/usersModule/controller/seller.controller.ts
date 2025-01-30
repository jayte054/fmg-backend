import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { SellerService } from '../service/seller.service';
import { SellerCredentials, UpdateCredentials } from '../utils/user.types';
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

  @Get('/findSellers')
  @HttpCode(HttpStatus.FOUND)
  async findBuyers(
    @Req() req: Request,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const { user }: any = req;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.sellerService.findSellers(user, pageNum, limitNum);
  }

  @Put('/updateSeller')
  @HttpCode(HttpStatus.OK)
  async updateSeller(
    @Req() req: Request,
    @Body(ValidationPipe) updateCredentials: UpdateCredentials,
  ) {
    const { user }: any = req;
    return await this.sellerService.updateSeller(user, updateCredentials);
  }

  @Delete('/deleteSeller')
  @HttpCode(HttpStatus.OK)
  async deleteSeller(@Req() req: Request) {
    const { user }: any = req;
    return await this.sellerService.deleteSeller(user);
  }
}
