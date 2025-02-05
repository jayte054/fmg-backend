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
import { DealerService } from '../service/dealer.service';
import { DealerCredentials, UpdateCredentials } from '../utils/user.types';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('dealer')
export class DealerController {
  constructor(private dealerService: DealerService) {}

  @Post('/createDealer')
  @HttpCode(HttpStatus.CREATED)
  async createDealer(
    @Body(ValidationPipe) dealerCredentials: DealerCredentials,
    @Req() req: Request,
  ) {
    const { user }: any = req;
    return await this.dealerService.createDealer(user, dealerCredentials);
  }

  @Get('/findDealerById')
  @HttpCode(HttpStatus.OK)
  async findDealerById(@Req() req: Request) {
    const { user }: any = req;
    return await this.dealerService.findDealerById(user.id);
  }

  @Get('/findDealers')
  @HttpCode(HttpStatus.FOUND)
  async findBuyers(
    @Req() req: Request,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const { user }: any = req;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.dealerService.findDealers(user, pageNum, limitNum);
  }

  @Put('/updateDealer')
  @HttpCode(HttpStatus.OK)
  async updateDealer(
    @Req() req: Request,
    @Body(ValidationPipe) updateCredentials: UpdateCredentials,
  ) {
    const { user }: any = req;
    return await this.dealerService.updateDealer(user, updateCredentials);
  }

  @Delete('/deleteDealer')
  @HttpCode(HttpStatus.OK)
  async deleteDealer(@Req() req: Request) {
    const { user }: any = req;
    return await this.dealerService.deleteDealer(user);
  }
}
