import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BuyerService } from '../service/user.service';
import { BuyerCredentials } from '../utils/user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { Request } from 'express';
import { DuplicateException } from 'src/common/exceptions/exceptions';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
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
}
