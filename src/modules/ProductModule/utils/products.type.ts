import { RetailScale } from 'src/modules/usersModule/utils/user.types';

export interface DriversArray {
  driver1Id: string;
  driver2Id: string;
  driver3Id: string;
  driver4Id: string;
}

export interface Reviewers {
  name: string;
  review: string;
  rating: number;
}

export interface ProductResponse {
  productId: string;
  providerName: string;
  phoneNumber: string;
  scale: RetailScale;
  pricePerKg: number;
  rating: number;
  address: string;
  location: string;
  linkedDriversId: DriversArray[];
  reviews: Reviewers[];
  purchases: number;
  dealerId: string;
}

export interface CreateProductCredentials {
  pricePerKg: number;
}
