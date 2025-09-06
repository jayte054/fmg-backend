import {
  CylinderType,
  PriceType,
  PurchaseType,
} from 'src/modules/purchaseModule/utils/purchase.type';
import { OrderTemplateEntity } from '../../orderTemplateEntity/orderTemplate.entity';

export interface OrderTemplateCredentials {
  productId: string;
  accessoryIds?: string[];
  title: string;
  priceType: PriceType;
  cylinder?: CylinderType;
  purchaseType: PurchaseType;
  buyerName: string;
  address: string;
  locations: JSON;
  metadata: Record<string, unknown>;
  buyerId: string;
}

export interface TemplateFilter {
  productId?: string;
  buyerId?: string;
  search?: string;
  createdAt?: string;
  skip?: number;
  take?: number;
}

export interface TemplateResponse {
  templateId: string;
  productId: string;
  accessoryIds?: string[];
  title: string;
  priceType: PriceType;
  cylinder?: CylinderType;
  purchaseType: PurchaseType;
  buyerName: string;
  address: string;
  createdAt: string;
  location: { latitude: number; longitude: number };
  metadata: Record<string, unknown>;
  buyerId: string;
}

export interface PaginatedTemplateFilter {
  templates: OrderTemplateEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedTemplateResponse {
  templates: OrderTemplateEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface SuccessfulResponse<T> {
  message: string;
  status: number;
  data: T;
}
