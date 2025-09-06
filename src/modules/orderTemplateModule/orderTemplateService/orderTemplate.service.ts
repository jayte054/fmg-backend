import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OrderTemplateDto } from '../orderTemplateRepository/utils/dto';
import {
  OrderTemplateCredentials,
  SuccessfulResponse,
  TemplateResponse,
} from '../orderTemplateRepository/utils/types';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { OrderTemplateEntity } from '../orderTemplateEntity/orderTemplate.entity';
import { validatePurchaseTypes } from 'src/modules/purchaseModule/utils/utils';
import { IOrderInterfaceRepository } from '../interface/iOrderRepositoryInterface';
import { DuplicateException } from 'src/common/exceptions/exceptions';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';

@Injectable()
export class OrderTemplateService {
  private logger = new Logger(OrderTemplateService.name);
  constructor(
    @Inject('IOrderInterfaceRepository')
    private templateRepository: IOrderInterfaceRepository,

    private auditLogService: AuditLogService,
  ) {}

  createOrderTemplate = async (
    buyer: BuyerEntity,
    orderTemplateDto: OrderTemplateDto,
  ): Promise<SuccessfulResponse<TemplateResponse>> => {
    const {
      productId,
      accessoryIds,
      title,
      priceType,
      cylinder,
      purchaseType,
    } = orderTemplateDto;

    await this.duplicateTemplate(buyer.buyerId, title);
    validatePurchaseTypes(purchaseType, priceType, cylinder);

    const orderTemplateCredentials: OrderTemplateCredentials = {
      productId,
      accessoryIds,
      title,
      priceType,
      cylinder,
      purchaseType,
      buyerName: `${buyer.firstName} ${buyer.lastName}`,
      address: buyer.address,
      location: buyer.location,
      createdAt: new Date(),
      metadata: {
        timesUsed: 0,
      },
      buyerId: buyer.buyerId,
    };

    const template = await this.templateRepository.createOrderTemplate(
      orderTemplateCredentials,
    );

    if (!template) {
      this.logger.error('failed to created template');
      throw new InternalServerErrorException('failed to create template');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Template,
      description: 'order template created',
      email: buyer.email,
      details: {
        templateId: template.templateId,
        title: template.title,
      },
    });

    this.logger.log(`order template ${template.title} created successfully`);
    return this.successfulResponse(template, 'createOrderTemplate');
  };

  private duplicateTemplate = async (title: string, buyerId: string) => {
    const template = await this.templateRepository.getOrderTemplate(
      buyerId,
      title,
    );
    if (template) {
      this.logger.error(`template with title ${title} already exists`);
      this.auditLogService.error({
        logCategory: LogCategory.Template,
        description: `duplicate template detected`,
        details: {
          title,
          createdAt: JSON.stringify(new Date()),
        },
        status: HttpStatus.CONFLICT,
      });
      throw new DuplicateException(
        `template with title ${title} already exists`,
      );
    }
  };

  private successfulResponse = (
    orderTemplateEntity: OrderTemplateEntity,
    endpointType?: string,
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
