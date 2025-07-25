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
import { DealerService } from '../service/dealer.service';
import { DealerCredentials, UpdateCredentials } from '../utils/user.types';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('dealer')
@UseGuards(JwtAuthGuard)
@Controller('dealer')
export class DealerController {
  constructor(private dealerService: DealerService) {}

  @Post('/createDealer')
  @ApiOperation({ summary: 'create dealer' })
  @ApiResponse({ status: 201, description: 'dealer created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createDealer(
    @Body(ValidationPipe) dealerCredentials: DealerCredentials,
    @Req() req: Request,
  ) {
    const { user }: any = req;
    return await this.dealerService.createDealer(user, dealerCredentials);
  }

  @Get('/findDealerById/:dealerId')
  @ApiOperation({ summary: 'fetched dealer' })
  @ApiResponse({ status: 200, description: 'user fetched dealer' })
  @HttpCode(HttpStatus.OK)
  async findDealerById(
    @Req() req: Request,
    @Param('dealerId') dealerId: string,
  ) {
    const { user }: any = req;
    return await this.dealerService.findDealerById(user.id, dealerId);
  }

  @Get('/findDealers')
  @ApiOperation({ summary: 'fetched dealers' })
  @ApiResponse({ status: 200, description: 'user fetched dealers' })
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

  @Put('/updateDealer/:dealerId')
  @ApiOperation({ summary: 'update dealer' })
  @ApiResponse({ status: 200, description: 'user updated dealer' })
  @HttpCode(HttpStatus.OK)
  async updateDealer(
    @Req() req: Request,
    @Param('dealerId') dealerId: string,
    @Body(ValidationPipe) updateCredentials: UpdateCredentials,
  ) {
    const { user }: any = req;
    return await this.dealerService.updateDealer(
      user,
      dealerId,
      updateCredentials,
    );
  }

  @Delete('/deleteDealer/:dealerId')
  @ApiOperation({ summary: 'deleted dealer' })
  @ApiResponse({ status: 200, description: 'user deleted dealer' })
  @HttpCode(HttpStatus.OK)
  async deleteDealer(@Req() req: Request, @Param('dealerId') dealerId: string) {
    const { user }: any = req;
    return await this.dealerService.deleteDealer(user, dealerId);
  }
}
