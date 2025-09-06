import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderTemplateEntity } from '../orderTemplateEntity/orderTemplate.entity';
import {
  OrderTemplateCredentials,
  TemplateFilter,
} from '../orderTemplateRepository/utils/types';
import { paginatedTemplates } from '../orderTemplateRepository/utils/utils';

@Injectable()
export class OrderTemplateRepository extends Repository<OrderTemplateEntity> {
  constructor(private dataSource: DataSource) {
    super(OrderTemplateEntity, dataSource.createEntityManager());
  }

  createOrderTemplate = async (
    orderTemplateCredentials: OrderTemplateCredentials,
  ) => {
    const newTemplate = this.create(orderTemplateCredentials);
    const template = await this.save(newTemplate);
    return template;
  };

  getOrderTemplate = async (
    buyerId: string,
    templateId?: string,
    title?: string,
  ) => {
    const query = this.createQueryBuilder('template');

    query.where('template.buyerId = :buyerId', { buyerId });

    if (templateId)
      query.andWhere('template.templateId = :templateId', { templateId });

    if (title) query.andWhere('template.title = :title', { title });

    return query.getOne();
  };

  getOrderTemplates = async (templateFilter: TemplateFilter) => {
    const { productId, buyerId, search, createdAt, skip, take } =
      templateFilter;
    const query = this.createQueryBuilder('template');

    if (productId) {
      query.andWhere('template.productId = :productId', { productId });
    }

    if (buyerId) {
      query.andWhere('template.buyerId = :buyerId', { buyerId });
    }

    if (search) {
      const lowerCaseSearch = `5${search.toLowerCase()}%`;
      query.andWhere(
        `
        LOWER(template.title) ILIKE :lowerCaseSearch
        OR LOWER(template.buyerName) ILIKE :lowerCaseSearch
        OR LOWER()
        `,
        { lowerCaseSearch },
      );
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('template.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    const [templates, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginatedTemplates({ templates, total, skip, take });
  };

  updateOrderTemplate = async (
    templateId: string,
    updateInput: Partial<OrderTemplateEntity>,
  ) => {
    const updateTemplate = await this.update(templateId, updateInput);
    if (updateTemplate.affected > 0) {
      return await this.findOne({ where: { templateId } });
    } else return 'failed to update template';
  };

  deleteOrderTemplate = async (templateId: string) => {
    const deletedTemplate = await this.delete({ templateId });
    if (deletedTemplate.affected > 0) {
      return 'order template deleted successfully';
    } else return 'failed to delete order template';
  };
}
