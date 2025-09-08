import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OrderTemplateService } from '../orderTemplateService/orderTemplate.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { GetBuyerDecorator } from 'src/common/decorators/getBuyerDecorator';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  OrderTemplateDto,
  PaginatedTemplateResponseDto,
  SuccessfulResponse,
  TemplateFilterDto,
  TemplateResponseDto,
  UpdateInputDto,
} from '../orderTemplateRepository/utils/dto';
import { TemplateResponse } from '../orderTemplateRepository/utils/types';

@ApiTags('OrderTemplate')
@UseGuards(JwtAuthGuard)
@Controller('orderTemplate')
export class OrderTemplateController {
  constructor(private orderTemplateService: OrderTemplateService) {}

  @Post('createOrderTemplate')
  @ApiOperation({ summary: 'create order template' })
  @ApiResponse({
    status: 201,
    description: 'order template successfully created',
    type: SuccessfulResponse<TemplateResponse>,
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrderTemplate(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Body(ValidationPipe) orderTemplateDto: OrderTemplateDto,
  ) {
    return await this.orderTemplateService.createOrderTemplate(
      buyer,
      orderTemplateDto,
    );
  }

  @Get('getOrderTemplate')
  @ApiOperation({ summary: 'get order template' })
  @ApiResponse({
    status: 200,
    description: 'get single order template',
    type: TemplateResponseDto,
  })
  @ApiQuery({ name: 'templateId', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @HttpCode(HttpStatus.OK)
  async getOrderTemplate(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Query('templateId') templateId?: string,
    @Query('title') title?: string,
  ) {
    return await this.orderTemplateService.getOrderTemplate(buyer, {
      templateId,
      title,
    });
  }

  @Get('getOrderTemplates')
  @ApiOperation({ summary: 'get order templates ' })
  @ApiResponse({
    status: 200,
    description: 'fetch order templates',
    type: PaginatedTemplateResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async getOrderTemplates(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Query(ValidationPipe) templateFilterDto: TemplateFilterDto,
  ) {
    return await this.orderTemplateService.getOrderTemplates(
      buyer,
      templateFilterDto,
    );
  }

  @Patch('updateOrderTemplate/:templateId')
  @ApiOperation({ summary: 'update order templates' })
  @ApiResponse({
    status: 200,
    description: 'update order template',
    type: TemplateResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async updateOrderTemplate(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('templateId') templateId: string,
    @Body(ValidationPipe) updateInputDto: UpdateInputDto,
  ) {
    return await this.orderTemplateService.updateOrderTemplate(
      buyer,
      templateId,
      updateInputDto,
    );
  }

  @Delete('deleteOrderTemplate/:templateId')
  @ApiOperation({ summary: 'delete order template' })
  @ApiResponse({
    status: 200,
    description: 'delete order template',
    type: String,
  })
  async deleteOrderTemplate(
    @GetBuyerDecorator() buyer: BuyerEntity,
    @Param('templateId') templateId: string,
  ) {
    return await this.orderTemplateService.deleteOrderTemplate(
      buyer,
      templateId,
    );
  }
}
