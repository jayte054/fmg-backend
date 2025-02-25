import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';
import { PurchaseResObj, PurchaseResponse } from '../utils/purchase.type';

export interface IPurchaseRepository {
  createPurchase(
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseResponse>;

  findPurchaseById(purchaseId: string): Promise<PurchaseResponse>;
  findPurchases(options: {
    skip: number;
    take: number;
  }): Promise<PurchaseResObj>;
  updatePurchase(
    purchaseId: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<PurchaseResponse>;
}
