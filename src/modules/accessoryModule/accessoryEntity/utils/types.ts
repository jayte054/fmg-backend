import { AccessoryEntity } from '../accessoryEntity';

export interface CreateAccessoryInput {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  quantity: string;
  isActive: boolean;
  dealerId: string;
  rating: number;
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
