import { HttpCode, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { OrderTemplateRepository } from '../templateRepository/orderTemplate.repository';
import { OrderTemplateDto } from '../orderTemplateRepository/utils/dto';
import {
  SuccessfulResponse,
  TemplateResponse,
} from '../orderTemplateRepository/utils/types';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { OrderTemplateEntity } from '../orderTemplateEntity/orderTemplate.entity';

@Injectable()
export class OrderTemplateService {
  private logger = new Logger(OrderTemplateService.name);
  constructor(private templateRepository: OrderTemplateRepository) {}

  //   createOrderTemplate = (
  //     buyer: BuyerEntity,
  //     orderTemplateDto: OrderTemplateDto,
  //   ): Promise<SuccessfulResponse<TemplateResponse>> => {};

  private successfulResponse = (
    endpointType: string,
    orderTemplateEntity: OrderTemplateEntity,
  ): SuccessfulResponse<TemplateResponse> => {
    return {
      message: 'Successful',
      status:
        endpointType === 'createOrderTemplate'
          ? HttpStatus.CREATED
          : HttpStatus.OK,
      data: this.maptoOrderTemplateResponse(orderTemplateEntity),
    };
  };

  private maptoOrderTemplateResponse = (
    orderTemplateEntity: OrderTemplateEntity,
  ): TemplateResponse => {
    return {
      templateId: orderTemplateEntity.templateId,
      productId: orderTemplateEntity.productId,
      accessoryIds: orderTemplateEntity.accessoryIds,
      title: orderTemplateEntity.title,
      priceType: orderTemplateEntity.priceType,
      cylinder: orderTemplateEntity.cylinder,
      purchaseType: orderTemplateEntity.purchaseType,
      buyerName: orderTemplateEntity.buyerName,
      address: orderTemplateEntity.address,
      createdAt: orderTemplateEntity.createdAt.toISOString(),
      location: orderTemplateEntity.location,
      metadata: orderTemplateEntity.metadata,
      buyerId: orderTemplateEntity.buyerId,
    };
  };
}
