import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BuyerService } from '../service/buyer.service';
import { BuyerCredentials } from '../utils/user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { Request } from 'express';
import { DuplicateException } from 'src/common/exceptions/exceptions';
import { UpdateBuyerDto } from '../utils/user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class BuyerController {
  constructor(private buyerService: BuyerService) {}

  @Post('/buyer')
  @HttpCode(HttpStatus.CREATED)
  async createBuyer(
    @Body(ValidationPipe) buyerCredentials: BuyerCredentials,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      return await this.buyerService.createBuyer(buyerCredentials, user);
    } catch (error) {
      if (error instanceof DuplicateException) {
        throw error;
      }
      throw new InternalServerErrorException('failed to create buyer');
    }
  }

  @Get('/findBuyerById')
  @HttpCode(HttpStatus.FOUND)
  async findBuyerById(@Req() req: Request) {
    const { user }: any = req;
    return await this.buyerService.findBuyerById(user);
  }

  @Get('/findBuyers')
  @HttpCode(HttpStatus.FOUND)
  async findBuyers(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.buyerService.findBuyers(pageNum, limitNum);
  }

  @Put('/updateBuyer')
  @HttpCode(HttpStatus.OK)
  async updateBuyer(
    @Req() req: Request,
    @Body(ValidationPipe) updateData: UpdateBuyerDto,
  ) {
    const { user }: any = req;
    return await this.buyerService.updateBuyer(user, updateData);
  }

  @Delete('/deleteBuyer')
  @HttpCode(HttpStatus.OK)
  async deleteBuyer(@Req() req: Request) {
    const { user }: any = req;
    return await this.buyerService.deleteBuyer(user);
  }
}
