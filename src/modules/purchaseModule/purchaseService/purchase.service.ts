import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IPurchaseRepository } from '../interface/IPurchaseRepository.interface';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  CreatePurchaseCredentials,
  PurchaseResponse,
} from '../utils/purchase.type';
import { CreatePurchaseDto } from '../utils/purchase.dto';

@Injectable()
export class PurchaseService {
  private logger = new Logger('PurchaseService');
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepository: IPurchaseRepository,
  ) {}

  createPurchase = async (
    buyer: BuyerEntity,
    createPurchaseCredentials: CreatePurchaseCredentials,
  ): Promise<PurchaseResponse> => {
    const { price, purchaseType, cylinderType, priceType, address, productId } =
      createPurchaseCredentials;

    try {
      const createPurchaseDto: CreatePurchaseDto = {
        purchaseId: uuidv4(),
        productId,
        price,
        priceType,
        cylinderType,
        purchaseType,
        buyerName: buyer.firstName + ' ' + buyer.lastName,
        address: buyer.address || address,
        location: buyer.location,
        purchaseDate: Date.now().toLocaleString(),
        buyerId: buyer.buyerId,
      };

      const purchase: PurchaseResponse =
        await this.purchaseRepository.createPurchase(createPurchaseDto);

      if (purchase) {
        this.logger.verbose(`purchase by ${buyer.buyerId} posted successfully`);
        return this.mapPurchaseResponse(purchase);
      }
    } catch (error) {
      this.logger.error('failed to complete purchase by dealer', buyer.buyerId);
      throw new InternalServerErrorException('failed to complete purchase');
    }
  };

  private mapPurchaseResponse = (
    purchaseResponse: PurchaseResponse,
  ): PurchaseResponse => {
    return {
      purchaseId: purchaseResponse.purchaseId,

      productId: purchaseResponse.productId,

      price: purchaseResponse.price,

      priceType: purchaseResponse.priceType,

      cylinderType: purchaseResponse.cylinderType,

      purchaseType: purchaseResponse.purchaseType,

      buyerName: purchaseResponse.buyerName,

      address: purchaseResponse.address,

      location: purchaseResponse.location,

      purchaseDate: purchaseResponse.purchaseDate,

      buyerId: purchaseResponse.buyerId,
    };
  };
}
