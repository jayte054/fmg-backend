import {
  Body,
  Controller,
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
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { Request } from 'express';
import { DuplicateException } from '../../../common/exceptions/exceptions';
import {
  BuyerCredentialsDto,
  BuyerResponseDto,
  BuyersFilterDto,
  PaginatedBuyerResponseDto,
  UpdateBuyerDto,
} from '../utils/user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class BuyerController {
  constructor(private buyerService: BuyerService) {}

  @Post('/buyer')
  @ApiOperation({ summary: 'create buyer' })
  @ApiResponse({
    status: 200,
    description: 'buyer created successfully',
    type: BuyerResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createBuyer(
    @Body(ValidationPipe) buyerCredentials: BuyerCredentialsDto,
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
  @ApiOperation({ summary: 'find buyer' })
  @ApiResponse({
    status: 200,
    description: 'buyer fetched successfully',
    type: BuyerResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findBuyerById(@Req() req: Request) {
    const { user }: any = req;
    return await this.buyerService.findBuyerById(user);
  }

  @Get('/findBuyers')
  @ApiOperation({ summary: 'fetch buyers list' })
  @ApiResponse({
    status: 302,
    description: 'buyer list fetched successfully',
    type: PaginatedBuyerResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findBuyers(@Query() filterDto: BuyersFilterDto) {
    return await this.buyerService.findBuyers(filterDto);
  }

  @Put('/updateBuyer')
  @ApiOperation({ summary: 'updated buyer' })
  @ApiResponse({
    status: 200,
    description: 'buyer created successfully',
    type: BuyerResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async updateBuyer(
    @Req() req: Request,
    @Body(ValidationPipe) updateData: UpdateBuyerDto,
  ) {
    const { user }: any = req;
    return await this.buyerService.updateBuyer(user, updateData);
  }

  @Put('/deleteBuyer')
  @ApiOperation({ summary: 'set buyer status to deleted' })
  @ApiResponse({
    status: 200,
    description: 'buyer delete status successful',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async deleteBuyer(@Req() req: Request) {
    const { user }: any = req;
    return await this.buyerService.deleteBuyer(user);
  }
}
