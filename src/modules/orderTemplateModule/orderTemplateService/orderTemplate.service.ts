import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  FindOrderTemplateDto,
  OrderTemplateDto,
  TemplateFilterDto,
  UpdateInputDto,
} from '../orderTemplateRepository/utils/dto';
import {
  OrderTemplateCredentials,
  SuccessfulResponse,
  TemplateFilter,
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

  getOrderTemplate = async (
    buyer: BuyerEntity,
    payload: FindOrderTemplateDto,
  ) => {
    const { buyerId } = buyer;
    const { templateId, title } = payload;
    const orderTemplate = await this.templateRepository.getOrderTemplate(
      buyerId,
      templateId,
      title,
    );

    if (!orderTemplate) {
      this.logger.error(
        `failed to find order template with id ${templateId ? templateId : title}`,
      );
      this.auditLogService.error({
        logCategory: LogCategory.Template,
        email: buyer.email,
        description: `failed to find order with template ${templateId ? templateId : title}`,
        details: {
          templateId,
          title,
        },
        status: HttpStatus.CONTINUE,
      });
      throw new NotFoundException('failed to find order template');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Template,
      description: `order template successfully retrieved`,
      email: buyer.email,
      details: {
        templateId,
        title,
      },
    });

    this.logger.log('order template successfully retrieved');
    return this.mapToOrderTemplateResponse(orderTemplate);
  };

  getOrderTemplates = async (
    buyer: BuyerEntity,
    templateFilterDto: TemplateFilterDto,
  ) => {
    const { productId, buyerId, search, createdAt, skip, take } =
      templateFilterDto;

    const templateFilter: TemplateFilter = {
      ...(productId !== undefined && { productId }),
      ...(buyerId !== undefined && { buyerId }),
      ...(search !== undefined && { search }),
      ...(createdAt !== undefined && { createdAt }),
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    };

    const templates =
      await this.templateRepository.getOrderTemplates(templateFilter);

    this.auditLogService.log({
      logCategory: LogCategory.Template,
      description: 'order templates fetched successfully',
      email: buyer.email,
      details: {
        templateFilter: JSON.stringify(templateFilter),
        count: templates.total.toString(),
      },
    });

    this.logger.log('template successfully retrieved');
    return templates;
  };

  updateOrderTemplate = async (
    buyer: BuyerEntity,
    templateId: string,
    updateInputDto: UpdateInputDto,
  ) => {
    const {
      priceType,
      cylinderType,
      purchaseType,
      address,
      location,
      metadata,
    } = updateInputDto;

    const updateInput: Partial<OrderTemplateEntity> = {
      ...(priceType !== undefined && { priceType }),
      ...(cylinderType !== undefined && { cylinderType }),
      ...(purchaseType !== undefined && { purchaseType }),
      ...(address !== undefined && { address }),
      ...(location !== undefined && { location }),
      ...(metadata !== undefined && { metadata }),
    };

    if (Object.keys(updateInput).length === 0) {
      this.logger.error('empty update parameters');
      this.auditLogService.error({
        logCategory: LogCategory.Template,
        description: 'empty update parameters',
        email: buyer.email,
        details: {
          templateId,
        },
        status: HttpStatus.BAD_REQUEST,
      });
      throw new BadRequestException('empty update parameters');
    }

    const updatedTemplate = await this.templateRepository.updateOrderTemplate(
      templateId,
      updateInput,
    );

    if (updatedTemplate === 'failed to update template') {
      this.logger.error({
        logCategory: LogCategory.Template,
        description: 'failed to update template',
        email: buyer.email,
        details: {
          templateId,
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      throw new InternalServerErrorException('failed to update template');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Template,
      description: 'template successfully updated',
      email: buyer.email,
      details: {
        templateId,
        updateInput: JSON.stringify(updateInput),
      },
    });
    this.logger.log(`order template ${templateId} successfully updated`);
    return updatedTemplate;
  };

  deleteOrderTemplate = async (buyer: BuyerEntity, templateId: string) => {
    const deleteTemplate =
      await this.templateRepository.deleteTemplate(templateId);

    if (deleteTemplate === 'failed to delete order template') {
      this.logger.error(`failed to delete template ${templateId}`);
      this.auditLogService.error({
        logCategory: LogCategory.Template,
        email: buyer.email,
        description: 'failed to delete template',
        details: {
          templateId,
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      throw new InternalServerErrorException('failed to delete template');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Template,
      email: buyer.email,
      description: 'template successfully deleted',
      details: {
        templateId,
      },
    });
    this.logger.log(`template ${templateId} successfully deleted`);
    return deleteTemplate;
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
      data: this.mapToOrderTemplateResponse(orderTemplateEntity),
    };
  };

  private mapToOrderTemplateResponse = (
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
