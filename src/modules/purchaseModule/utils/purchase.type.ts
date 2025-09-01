import {
  DriverDetails,
  ProductResponse,
} from '../../ProductModule/utils/products.type';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';

export enum PurchaseType {
  debut_order = 'debut order',
  cylinder_swap_order = 'cylinder swap order', //customer swaps cylinder with vendor
  gas_swap_order = 'gas swap order', // swaps cylinder with customer while fulfilling the value of the purchase
  commission_order = 'commission order', // customer's cylinder is picked up filled and returned
}

export enum PriceType {
  cylinder_price = 'cylinder_price',
  custom_price = 'custom_price',
}

export enum CylinderType {
  three_kg = '3kg',
  five_kg = '5kg',
  six_kg = '6kg',
  twelve_five_kg = '12.5kg',
  twentyFive_kg = '25kg',
  fifty_kg = '50kg',
}

export interface PurchaseResponse {
  purchaseId: string;

  productId: string;

  accessories?: string[];

  deliveryFee: string;

  price: string;

  priceType: PriceType;

  cylinder: CylinderType;

  purchaseType: PurchaseType;

  buyerName: string;

  address: string;

  location: { latitude: number; longitude: number };

  purchaseDate: string;

  buyerId: string;

  metadata?: Record<string, string>;
}

export interface CreatePurchaseCredentials {
  productId: string;

  price: string;

  deliveryFee: string;

  cylinderType: CylinderType;

  priceType: PriceType;

  purchaseType: PurchaseType;

  address?: string;
}

export interface DebutOrderCredentials {
  productId: string;
  accessoryIds?: string[];
  price: string;
  deliveryFee: string;
  cylinderType: CylinderType;
  priceType: PriceType;
  purchaseType: PurchaseType;
  address?: string;
}

export interface PurchaseResObj {
  purchases: PurchaseResponse[];
  total: number;
}

export interface UpdatePurchaseCredentials {
  price?: string;
  cylinderType?: CylinderType;
  priceType?: PriceType;
  purchaseType?: PurchaseType;
  address?: string;
}

export interface NotificationDto {
  purchase: PurchaseResponse;
  product: ProductResponse;
  buyer: BuyerEntity;
  price: string;
  purchaseType: string;
  cylinderType: string;
  priceType?: string;
  address?: string;
  linkedDrivers: DriverDetails[];
  dealerId?: string;
}

export interface UserNotificationResponse {
  notificationId: string;
  driverName?: string;
  buyerId?: string;
  purchaseId: string;
  dealerId?: string;
  productName?: string;
  message: string;
  address: string;
  location: { latitude: number; longitude: number };
  isRead: boolean;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface FindPurchaseByIdInterface {
  productId?: string;
  dealerId?: string;
  buyerId?: string;
  driverId?: string;
  page: string;
  limit: string;
}
