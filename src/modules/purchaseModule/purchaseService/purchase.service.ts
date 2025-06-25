import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPurchaseRepository } from '../interface/IPurchaseRepository.interface';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  CreatePurchaseCredentials,
  CylinderType,
  NotificationDto,
  PriceType,
  PurchaseResObj,
  PurchaseResponse,
  UpdatePurchaseCredentials,
  UserNotificationResponse,
} from '../utils/purchase.type';
import { CreatePurchaseDto, UpdatePurchaseDto } from '../utils/purchase.dto';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { ProductService } from 'src/modules/ProductModule/productService/product.service';
import { PushNotificationService } from 'src/modules/notificationModule/notificationService/push-notification.service';
import { validatePurchaseTypes } from '../utils/utils';

@Injectable()
export class PurchaseService {
  private logger = new Logger('PurchaseService');
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly productService: ProductService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  createPurchase = async (
    buyer: BuyerEntity,
    createPurchaseCredentials: CreatePurchaseCredentials,
  ): Promise<{
    purchaseResponse: PurchaseResponse;
    driverNotificationResponse: UserNotificationResponse;
    userNotificationResponse: UserNotificationResponse;
  }> => {
    const { price, purchaseType, cylinderType, priceType, address, productId } =
      createPurchaseCredentials;

    validatePurchaseTypes(purchaseType, cylinderType, priceType);

    try {
      const product =
        await this.productService.findProductByPurchaseService(productId);
      if (!product) return;

      const { linkedDrivers } = product;

      const createPurchaseDto: CreatePurchaseDto = {
        productId,
        price:
          priceType === PriceType.custom_price
            ? price
            : String(
                product.pricePerKg *
                  parseFloat(CylinderType[cylinderType].slice(0, -2)),
              ),
        priceType,
        cylinder: CylinderType[cylinderType],
        purchaseType,
        buyerName: buyer.firstName + ' ' + buyer.lastName,
        address: buyer.address || address,
        location: buyer.location,
        purchaseDate: new Date().toLocaleString(),
        buyerId: buyer.buyerId,
        metadata: {
          driverId: linkedDrivers[0].driverId,
          buyerId: buyer.buyerId,
          purchaseTitle: `${buyer.firstName}/${cylinderType}/${purchaseType}`,
          phoneNumber: buyer.phoneNumber,
          driver_phoneNumber: linkedDrivers[0].driverPhoneNumber.toString(),
        },
      };

      const purchase =
        await this.purchaseRepository.createPurchase(createPurchaseDto);

      if (purchase) {
        const notificationDto: NotificationDto = {
          purchase,
          buyer,
          product,
          linkedDrivers,
          price,
          purchaseType,
          cylinderType,
          dealerId: product.dealerId,
        };

        const sendDriverNotificationResponse =
          await this.sendProduct(notificationDto);

        const sendUserNotification = await this.sendUser(notificationDto);

        this.logger.verbose(`purchase by ${buyer.buyerId} posted successfully`);
        const purchaseResponse = this.mapPurchaseResponse(purchase);

        return {
          driverNotificationResponse: sendDriverNotificationResponse,
          userNotificationResponse: sendUserNotification,
          purchaseResponse,
        };
      }
    } catch (error) {
      console.log(error);
      this.logger.error('failed to complete purchase by buyer', buyer.buyerId);
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

  findPurchasesByDriverId = async (driverId: string) => {
    const purchases = await this.purchaseRepository.findRawPurchases();

    if (purchases.length === 0) {
      this.logger.warn('there are no purchases');
      throw new NotFoundException('empty purchases');
    }
    const driversPurchases = purchases.filter((purchase) => {
      return purchase?.metadata?.driverId === driverId;
    });

    if (driversPurchases.length === 0) {
      this.logger.warn('there are no purchases for driver', driverId);
      throw new NotFoundException('empty purchases');
    }

    const sortedPurchases = driversPurchases.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );

    return sortedPurchases;
  };

  findPurchasesByBuyerId = async (buyerId: string) => {
    const purchases = await this.purchaseRepository.findRawPurchases();

    if (purchases.length === 0) {
      this.logger.warn('there are no purchases');
      throw new NotFoundException('empty purchases');
    }

    const buyersPurchases = purchases.filter((purchase) => {
      return purchase.buyerId === buyerId;
    });

    if (buyersPurchases.length === 0) {
      this.logger.warn('there are no purchases for buyer', buyerId);
      throw new NotFoundException('empty purchases');
    }

    return buyersPurchases.sort(
      (a: any, b: any) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );
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
        'an error occurred, please try again',
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
        cylinderType: cylinderType ?? purchase.cylinder,
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

  deliverPurchase = async (
    driverId: string,
    purchaseId: string,
    delivery: boolean,
  ): Promise<{ Ok: boolean }> => {
    const purchase = await this.purchaseRepository.findPurchaseById(purchaseId);

    const metadata = { ...purchase.metadata };
    metadata.delivery = String(Object.values(delivery));

    const deliverPurchase = await this.purchaseRepository.updatePurchase(
      purchaseId,
      {
        metadata,
      },
    );

    if (deliverPurchase) {
      return { Ok: true };
    } else {
      return { Ok: false };
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
      cylinder: purchaseResponse.cylinder,
      purchaseType: purchaseResponse.purchaseType,
      buyerName: purchaseResponse.buyerName,
      address: purchaseResponse.address,
      location: purchaseResponse.location,
      purchaseDate: purchaseResponse.purchaseDate,
      buyerId: purchaseResponse.buyerId,
      metadata: purchaseResponse.metadata,
    };
  };

  private sendProduct = async (
    notificationDto: NotificationDto,
  ): Promise<UserNotificationResponse> => {
    const {
      purchase,
      buyer,
      product,
      linkedDrivers,
      price,
      purchaseType,
      cylinderType,
    } = notificationDto;

    const notification =
      await this.pushNotificationService.sendProductNotification({
        purchaseId: purchase.purchaseId,
        productId: product.productId,
        driverId: linkedDrivers[0].driverId,
        dealerId: product.dealerId,
        buyerId: buyer.buyerId,
        message: `
          your new purchase has been made, you are required for delivery, 
            find attached the details: 
            customer name: ${buyer.firstName + buyer.lastName},
            customer PhoneNumber: ${buyer.phoneNumber},
            customer address: ${buyer.address},
            customer location: ${buyer.location},
            purchase type: ${purchaseType},
            cylinder type: ${cylinderType},
            price: ${price}`,
        address: buyer.address,
        location: buyer.location,
      });

    return {
      notificationId: notification.notificationId,
      purchaseId: notification.purchaseId,
      message: notification.message,
      address: notification.address,
      location: notification.location,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toLocaleString(),
      metadata: notification.metadata,
    };
  };

  private sendUser = async (
    notificationDto: NotificationDto,
  ): Promise<UserNotificationResponse> => {
    const {
      purchase,
      buyer,
      product,
      linkedDrivers,
      price,
      purchaseType,
      cylinderType,
    } = notificationDto;

    const notification =
      await this.pushNotificationService.sendUserNotification({
        purchaseId: purchase.purchaseId,
        buyerId: buyer.buyerId,
        productName: product.providerName,
        driverName: linkedDrivers[0].driverName,
        message: `
          your new purchase has been made, you are required for delivery, 
            find attached the details: 
            customer name: ${buyer.firstName + buyer.lastName},
            customer PhoneNumber: ${buyer.phoneNumber},
            customer address: ${buyer.address},
            customer location: ${buyer.location},
            purchase type: ${purchaseType},
            cylinder type: ${cylinderType},
            price: ${price}`,
        address: buyer.address,
        location: buyer.location,
      });

    return {
      notificationId: notification.notificationId,
      driverName: linkedDrivers[0].driverName,
      buyerId: notification.buyerId,
      purchaseId: notification.purchaseId,
      productName: notification.productName,
      message: notification.message,
      address: notification.address,
      location: notification.location,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toLocaleString(),
      metadata: notification.metadata,
    };
  };
}
