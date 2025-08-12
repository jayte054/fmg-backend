import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';

export interface CreateAccessoryInput {
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  quantity: number;
  isActive: boolean;
  dealerId: string;
  rating: number;
  createdAt: Date;
  review: Record<string, string>;
  metadata: Record<string, string>;
}

export interface AccessoryFilter {
  dealerId?: string;
  search?: string;
  isActive?: string;
  rating?: number;
  skip?: number;
  take?: number;
}

export interface PaginatedAccessoriesInterface {
  accessories: AccessoryEntity[];
  total: number;
  skip?: number;
  take?: number;
}

export interface PaginatedAccessoriesResponse
  extends PaginatedAccessoriesInterface {
  page: number;
  perPage: number;
}

export interface CreateAccessoryResponse {
  success: boolean;
  message: string;
  accessory: AccessoryEntity;
}

export interface UpdateAccessoryInput {
  dealerId: string;
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  rating?: number;
  review?: Record<string, string>;
  metadata?: Record<string, string>;
}

export interface UpdateAccessoryResponse {
  status: string;
  message: string;
  data: AccessoryEntity;
}
