import { PurchaseEntity } from '../purchaseEntity/purchase.entity';
import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';
import { PurchaseResObj, PurchaseResponse } from '../utils/purchase.type';

export interface IPurchaseRepository {
  createPurchase(
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseResponse>;

  findPurchaseById(purchaseId: string): Promise<PurchaseResponse>;
  findRawPurchases(
    page: number,
    limit: number,
  ): Promise<PaginatedPurchaseResponse>;
  find(): Promise<PurchaseEntity[]>;
  findPurchases(options: {
    skip: number;
    take: number;
  }): Promise<PurchaseResObj>;
  updatePurchase(
    purchaseId: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<PurchaseResponse>;
  deletePurchase(purchaseId: string): Promise<string>;
}

export interface PaginatedPurchaseResponse {
  data: PurchaseEntity[];
  total: number;
  page: string;
  limit: string;
}
