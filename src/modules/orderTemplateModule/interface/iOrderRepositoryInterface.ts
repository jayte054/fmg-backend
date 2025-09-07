import { OrderTemplateEntity } from '../orderTemplateEntity/orderTemplate.entity';
import {
  OrderTemplateCredentials,
  PaginatedTemplateResponse,
  TemplateFilter,
} from '../orderTemplateRepository/utils/types';

export interface IOrderInterfaceRepository {
  createOrderTemplate(
    orderTemplateCredentials: OrderTemplateCredentials,
  ): Promise<OrderTemplateEntity>;
  getOrderTemplate(
    buyerId: string,
    templateId?: string,
    title?: string,
  ): Promise<OrderTemplateEntity>;
  getOrderTemplates(
    templateFilter: TemplateFilter,
  ): Promise<PaginatedTemplateResponse>;
  updateOrderTemplate(
    templateId: string,
    updateInput: Partial<OrderTemplateEntity>,
  ): Promise<OrderTemplateEntity | string>;
  deleteTemplate(templateId: string): Promise<string>;
}
