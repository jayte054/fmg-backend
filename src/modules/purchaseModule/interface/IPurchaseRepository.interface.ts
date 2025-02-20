import { CreatePurchaseDto } from '../utils/purchase.dto';
import { PurchaseResponse } from '../utils/purchase.type';

export interface IPurchaseRepository {
  createPurchase(
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseResponse>;
}
