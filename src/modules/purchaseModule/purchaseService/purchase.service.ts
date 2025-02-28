import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IPurchaseRepository } from '../interface/IPurchaseRepository.interface';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  CreatePurchaseCredentials,
  PurchaseResObj,
  PurchaseResponse,
  UpdatePurchaseCredentials,
} from '../utils/purchase.type';
import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';

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

  findPurchaseById = async (
    purchaseId: string,
    buyer: BuyerEntity,
    user: AuthEntity,
  ) => {
    try {
      const purchase =
        await this.purchaseRepository.findPurchaseById(purchaseId);

      if (!purchase) {
        this.logger.warn(`purchase with id ${purchaseId} not found`);
        throw new NotFoundException(`purchase record not found`);
      }
      if (purchase.buyerId !== buyer.buyerId || buyer.userId !== user.id) {
        this.logger.warn(`user with id ${buyer.buyerId} not found`);
        throw new UnauthorizedException('unauthorized access');
      } else {
        this.logger.verbose(
          `purchase with id ${purchaseId} successfully fetched`,
        );
        return this.mapPurchaseResponse(purchase);
      }
    } catch (error) {
      this.logger.error(
        `an error occurred when fetching purchase order with id ${purchaseId}`,
      );
      throw new InternalServerErrorException('an error occurred');
    }
  };

  findPurchases = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: PurchaseResponse[];
    total: number;
    currentPage: number;
  }> => {
    const currentPage = Math.max(page, 1);
    const currentLimit = Math.max(limit, 1);
    const skip = (currentPage - 1) * currentLimit;

    try {
      const { purchases, total }: PurchaseResObj =
        await this.purchaseRepository.findPurchases({
          skip,
          take: limit,
        });

      if (!purchases) {
        this.logger.warn('purchases not found');
        throw new NotFoundException('purchases not found');
      }

      this.logger.verbose('purchases fetched successfully');

      return {
        data: purchases,
        total,
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('error fetching purchases');
      throw new InternalServerErrorException(
        'an error occured, please try again',
      );
    }
  };

  updatePurchase = async (
    buyerId: string,
    purchaseId: string,
    updatePurchaseCredentials: UpdatePurchaseCredentials,
  ): Promise<PurchaseResponse> => {
    const { price, priceType, purchaseType, cylinderType, address } =
      updatePurchaseCredentials;

    try {
      const purchase: PurchaseResponse =
        await this.purchaseRepository.findPurchaseById(purchaseId);

      if (!purchase) {
        this.logger.warn(`purchase with id ${purchaseId} does not exist`);
        throw new NotFoundException(`purchase not found`);
      }

      if (purchase.buyerId !== buyerId) {
        this.logger.warn(`Unauthorized access attempt by buyer ID: ${buyerId}`);
        throw new UnauthorizedException(
          'User is not authorized to update this purchase.',
        );
      }

      const updatePurchaseDto: UpdatePurchaseDto = {
        purchaseId: purchase.purchaseId,
        productId: purchase.productId,
        price: price ?? purchase.price,
        priceType: priceType ?? purchase.priceType,
        cylinderType: cylinderType ?? purchase.cylinderType,
        buyerName: purchase.buyerName,
        address: address ?? purchase.address,
        location: purchase.location,
        purchaseType: purchaseType ?? purchase.purchaseType,
        purchaseDate: purchase.purchaseDate,
        buyerId: purchase.buyerId,
      };

      const newPurchase = await this.purchaseRepository.updatePurchase(
        purchaseId,
        updatePurchaseDto,
      );

      if (newPurchase) {
        this.logger.verbose(
          `purchase with id ${purchaseId} updated successfully`,
        );
        return this.mapPurchaseResponse(newPurchase);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(
        'an error occured while updating purchase with id ',
        purchaseId,
      );
      throw new InternalServerErrorException('an error occurred');
    }
  };

  deletePurchase = async (
    purchaseId: string,
    buyerId: string,
  ): Promise<string> => {
    try {
      const purchase =
        await this.purchaseRepository.findPurchaseById(purchaseId);

      if (!purchase) {
        this.logger.warn(`purchase with id ${purchaseId} not found`);
      }

      if (purchase.buyerId !== buyerId) {
        this.logger.warn('unauthorized access to purchase');
        throw new UnauthorizedException(
          'user not authorized to delete purchase',
        );
      }

      const response = await this.purchaseRepository.deletePurchase(purchaseId);

      return response;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        'an error occured while deleting purchase with id ',
        purchaseId,
      );
      throw new InternalServerErrorException('an error occurred');
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
