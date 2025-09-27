import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IPurchaseRepository,
  PaginatedPurchaseResponse,
} from '../interface/IPurchaseRepository.interface';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import {
  CreatePurchaseCredentials,
  CylinderType,
  // DebutOrderCredentials,
  FindPurchaseByIdInterface,
  NotificationDto,
  PriceType,
  PurchaseFilterInterface,
  PurchaseResObj,
  PurchaseResponse,
  PurchaseType,
  StandardPurchaseResponse,
  UpdatePurchaseCredentials,
  UserNotificationResponse,
} from '../utils/purchase.type';
import {
  CreatePurchaseDto,
  PurchaseFilterDto,
  UpdatePurchaseDto,
} from '../utils/purchase.dto';
import { AuthEntity } from '../../authModule/authEntity/authEntity';
import { ProductService } from '../../ProductModule/productService/product.service';
import { PushNotificationService } from '../../notificationModule/notificationService/push-notification.service';
import { validatePurchaseTypes } from '../utils/utils';
import { TokenService } from '../../tokenModule/tokenService/token.service';
import { TokenType } from '../../tokenModule/utils/token.interface';
import { MailerService } from '../../notificationModule/notificationService/mailerService';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';
import { MessagingService } from '../../notificationModule/notificationService/messaging.service';
import { PaymentService } from '../../paymentModule/service/payment.service';
import { PaymentVerification } from 'src/common/exceptions/exceptions';
import { DebutOrderCredentialsDto } from 'src/modules/paymentModule/utils/payment.dto';
import { AccessoryService } from 'src/modules/accessoryModule/accessoryService/accessory.service';
import { RevenueSource } from 'src/modules/paymentModule/utils/interface';
// import { PurchaseEntity } from '../purchaseEntity/purchase.entity';

@Injectable()
export class PurchaseService {
  private logger = new Logger('PurchaseService');
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly productService: ProductService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
    private readonly auditLogService: AuditLogService,
    private readonly messagingService: MessagingService,
    private readonly paymentService: PaymentService,
    private readonly accessoryService: AccessoryService,
  ) {}

  createPurchase = async (
    buyer: BuyerEntity,
    createPurchaseCredentials: CreatePurchaseCredentials,
    reference: string,
  ): Promise<StandardPurchaseResponse> => {
    const {
      price,
      deliveryFee,
      purchaseType,
      cylinderType,
      priceType,
      address,
      productId,
    } = createPurchaseCredentials;

    validatePurchaseTypes(purchaseType, cylinderType, priceType);

    const { tokenId, token, expiresAt } = await this.tokenService.createToken(
      TokenType.delivery_token,
      buyer.buyerId,
    );

    try {
      const { message } = await this.paymentService.verifyPayment(reference);

      if (message !== 'payment verified successfully') {
        this.logger.warn('payment verification unsuccessful');
        throw new PaymentVerification('unverified payment', {
          context: 'purchaseService',
        });
      }
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
        deliveryFee,
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
          tokenId,
          token,
          token_expiration: expiresAt,
        },
      };

      const purchase =
        await this.purchaseRepository.createPurchase(createPurchaseDto);

      await this.paymentService.updatePayment({
        reference,
        purchase,
        email: buyer.email,
        source: RevenueSource.GasPurchase,
      });

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

        await this.tokenService.updateToken(tokenId, purchase.purchaseId);

        const tokenNotificationInterface = {
          token,
          email: buyer.email,
          expiration: expiresAt,
          purchaseTitle: purchase?.metadata?.purchaseTitle,
        };

        const sendDriverNotificationResponse =
          await this.sendProduct(notificationDto);

        const sendUserNotification = await this.sendUser(notificationDto);

        await this.mailerService.sendDeliveryMail(tokenNotificationInterface);
        await this.messagingService.sendTokenMessage(
          buyer.phoneNumber,
          `please provide this delivery token ${token} to the driver to confirm delivery`,
          sendUserNotification.notificationId,
        );

        this.logger.verbose(`purchase by ${buyer.buyerId} posted successfully`);
        const purchaseResponse = this.mapPurchaseResponse(purchase);

        await this.auditLogService.log({
          logCategory: LogCategory.PURCHASE,
          description: 'post purchase',
          email: buyer.email,
          details: {
            purchaseType,
            priceType,
          },
        });

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

  createDebutOrderPurchase = async (
    buyer: BuyerEntity,
    debutOrderCredentials: DebutOrderCredentialsDto,
    reference: string,
  ): Promise<StandardPurchaseResponse> => {
    const {
      productId,
      accessoryIds,
      price,
      deliveryFee,
      cylinderType,
      priceType,
      purchaseType,
      address,
    } = debutOrderCredentials;

    validatePurchaseTypes(purchaseType, priceType, cylinderType);

    const { tokenId, token, expiresAt } = await this.tokenService.createToken(
      TokenType.delivery_token,
      buyer.buyerId,
    );

    try {
      const { message } = await this.paymentService.verifyPayment(reference);

      if (message !== 'payment verified successfully') {
        this.logger.warn('payment verification unsuccessful');
        throw new PaymentVerification('unverified payment', {
          context: 'purchaseService',
        });
      }
      const product =
        await this.productService.findProductByPurchaseService(productId);

      if (!product) {
        this.logger.error(`product with id ${productId} not found`);
        throw new NotFoundException('product not found');
      }

      const { data, message: mess } = await this.verifyAccessories(
        accessoryIds,
        buyer,
      );

      if (mess !== 'accessories verified successfully') {
        this.logger.error('accessory verification failed');
        throw new NotFoundException('accessory verification failed');
      } else {
        this.auditLogService.log({
          logCategory: LogCategory.PURCHASE,
          description: 'accessory verification',
          details: {
            accessoryIds: JSON.stringify(
              data.map((acc) => acc.data.accessoryId),
            ),
          },
        });
      }

      const { linkedDrivers } = product;

      const createPurchaseDto: CreatePurchaseDto = {
        productId,
        accessoryIds,
        price:
          priceType === PriceType.custom_price
            ? price
            : String(
                product.pricePerKg *
                  parseFloat(CylinderType[cylinderType].slice(0, -2)),
              ),
        deliveryFee,
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
          tokenId,
          token,
          token_expiration: expiresAt,
        },
      };

      const purchase =
        await this.purchaseRepository.createPurchase(createPurchaseDto);

      await this.paymentService.updatePayment({
        reference,
        purchase,
        email: buyer.email,
        source: RevenueSource.DebutGasPurchase,
      });

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

        await this.tokenService.updateToken(tokenId, purchase.purchaseId);

        const tokenNotificationInterface = {
          token,
          email: buyer.email,
          expiration: expiresAt,
          purchaseTitle: purchase?.metadata?.purchaseTitle,
        };

        const sendDriverNotificationResponse =
          await this.sendProduct(notificationDto);

        const sendUserNotification = await this.sendUser(notificationDto);

        await this.mailerService.sendDeliveryMail(tokenNotificationInterface);
        await this.messagingService.sendTokenMessage(
          buyer.phoneNumber,
          `please provide this delivery token ${token} to the driver to confirm delivery`,
          sendUserNotification.notificationId,
        );

        this.logger.verbose(`purchase by ${buyer.buyerId} posted successfully`);
        const purchaseResponse = this.mapPurchaseResponse(purchase);

        await this.auditLogService.log({
          logCategory: LogCategory.PURCHASE,
          description: 'post purchase',
          email: buyer.email,
          details: {
            productId,
            accessoryIds: JSON.stringify(accessoryIds),
            purchaseType,
            priceType,
          },
        });

        return {
          driverNotificationResponse: sendDriverNotificationResponse,
          userNotificationResponse: sendUserNotification,
          purchaseResponse,
        };
      }
    } catch (error) {
      console.log(error);
      if (
        error instanceof NotFoundException ||
        error instanceof PaymentVerification
      ) {
        throw error;
      }
      this.logger.error('failed to complete purchase by buyer', buyer.buyerId);
      throw new InternalServerErrorException('failed to complete purchase');
    }
  };

  createAccessoryPurchase = async (
    buyer: BuyerEntity,
    purchaseDto: CreatePurchaseDto,
    reference: string,
  ): Promise<StandardPurchaseResponse> => {
    const {
      productId,
      accessoryIds,
      price,
      deliveryFee,
      priceType,
      purchaseType,
      address,
    } = purchaseDto;

    validatePurchaseTypes(priceType, purchaseType);

    const { tokenId, token, expiresAt } = await this.tokenService.createToken(
      TokenType.delivery_token,
      buyer.buyerId,
    );

    try {
      const { message } = await this.paymentService.verifyPayment(reference);

      if (message !== 'payment verified successfully') {
        this.logger.warn('payment verification unsuccessful');
        throw new PaymentVerification('unverified payment', {
          context: 'purchaseService',
        });
      }

      const product =
        await this.productService.findProductByPurchaseService(productId);

      if (!product) {
        this.logger.error(`product with id ${productId} not found`);
        throw new NotFoundException('product not found');
      }

      const accessories = await this.verifyAccessories(accessoryIds, buyer);

      if (!accessories) {
        this.logger.error(
          `${accessoryIds.length > 1 ? 'accessories not found' : 'accessory not found'}`,
        );
        throw new NotFoundException(
          `${accessoryIds.length > 1 ? 'accessories not found' : 'accessory not found'}`,
        );
      }

      const { linkedDrivers } = product;

      const createPurchaseDto: CreatePurchaseDto = {
        productId,
        accessoryIds,
        price,
        deliveryFee,
        priceType,
        purchaseType,
        buyerName: buyer.firstName + ' ' + buyer.lastName,
        address: buyer.address || address,
        location: buyer.location,
        purchaseDate: new Date().toLocaleString(),
        buyerId: buyer.buyerId,
        metadata: {
          driverId: linkedDrivers[0].driverId,
          buyerId: buyer.buyerId,
          purchaseTitle: `${buyer.firstName}/${accessories.data.map((acc) => `${acc.data.title}/`)}/${purchaseType}`,
          phoneNumber: buyer.phoneNumber,
          driver_phoneNumber: linkedDrivers[0].driverPhoneNumber.toString(),
          tokenId,
          token,
          token_expiration: expiresAt,
        },
      };

      const purchase =
        await this.purchaseRepository.createPurchase(createPurchaseDto);

      await this.paymentService.updatePayment({
        reference,
        purchase,
        email: buyer.email,
        source: RevenueSource.AccessoryPurchase,
      });

      const notificationDto: NotificationDto = {
        purchase,
        buyer,
        product,
        linkedDrivers,
        price,
        purchaseType,
        dealerId: product.dealerId,
      };

      await this.tokenService.updateToken(tokenId, purchase.purchaseId);

      const tokenNotificationInterface = {
        token,
        email: buyer.email,
        expiration: expiresAt,
        purchaseTitle: purchase?.metadata?.purchaseTitle,
      };

      const sendDriverNotificationResponse =
        await this.sendProduct(notificationDto);

      const sendUserNotification = await this.sendUser(notificationDto);

      await this.mailerService.sendDeliveryMail(tokenNotificationInterface);
      await this.messagingService.sendTokenMessage(
        buyer.phoneNumber,
        `please provide this delivery token ${token} to the driver to confirm delivery`,
        sendUserNotification.notificationId,
      );

      this.logger.verbose(`purchase by ${buyer.buyerId} posted successfully`);
      const purchaseResponse = this.mapPurchaseResponse(purchase);

      await this.auditLogService.log({
        logCategory: LogCategory.PURCHASE,
        description: 'post purchase',
        email: buyer.email,
        details: {
          productId,
          accessoryIds: JSON.stringify(accessoryIds),
          purchaseType,
          priceType,
        },
      });

      return {
        driverNotificationResponse: sendDriverNotificationResponse,
        userNotificationResponse: sendUserNotification,
        purchaseResponse,
      };
    } catch (error) {
      this.logger.error('failed to complete accessory purchase');
      throw new InternalServerErrorException(
        'failed to complete accessory purchase',
      );
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

        await this.auditLogService.log({
          logCategory: LogCategory.PURCHASE,
          description: 'find purchase',
          email: buyer.email ?? user.email,
          details: {
            purchaseId,
          },
        });
        return this.mapPurchaseResponse(purchase);
      }
    } catch (error) {
      this.logger.error(
        `an error occurred when fetching purchase order with id ${purchaseId}`,
      );
      throw new InternalServerErrorException('an error occurred');
    }
  };

  findPurchaseByIdPayment = async (purchaseId: string) => {
    try {
      const purchase =
        await this.purchaseRepository.findPurchaseById(purchaseId);

      if (!purchase) {
        this.logger.warn(`purchase with id ${purchaseId} not found`);
        throw new NotFoundException(`purchase record not found`);
      }
      return this.mapPurchaseResponse(purchase);
    } catch (error) {
      this.logger.error(
        `an error occurred when fetching purchase order with id ${purchaseId}`,
      );
      throw new InternalServerErrorException('an error occurred');
    }
  };

  findPurchasesByDriverId = async (
    findPurchaseByIdInterface: FindPurchaseByIdInterface,
  ) => {
    const { driverId, page, limit } = findPurchaseByIdInterface;
    const purchases = await this.purchaseRepository.findRawPurchases(
      parseInt(page),
      parseInt(limit),
    );

    if (purchases.data.length === 0) {
      this.logger.warn('there are no purchases');
      throw new NotFoundException('empty purchases');
    }
    const driversPurchases = purchases.data.filter((purchase) => {
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

    await this.auditLogService.log({
      logCategory: LogCategory.PURCHASE,
      description: 'find purchase',
      details: {
        driverId,
        purchases: sortedPurchases.length.toString(),
      },
    });

    this.logger.log(`driver ${driverId} successfully fetched purchases`);
    return {
      data: sortedPurchases,
      total: sortedPurchases.length,
      page,
      limit,
    };
  };

  findPurchasesByBuyerId = async (
    findPurchaseByIdInterface: FindPurchaseByIdInterface,
  ): Promise<PaginatedPurchaseResponse> => {
    const { buyerId, page, limit } = findPurchaseByIdInterface;
    const purchases = await this.purchaseRepository.findRawPurchases(
      parseInt(page),
      parseInt(limit),
    );

    if (purchases.data.length === 0) {
      this.logger.warn('there are no purchases');
      throw new NotFoundException('empty purchases');
    }

    const buyersPurchases = purchases.data.filter((purchase) => {
      return purchase.buyerId === buyerId;
    });

    if (buyersPurchases.length === 0) {
      this.logger.warn('there are no purchases for buyer', buyerId);
      throw new NotFoundException('empty purchases');
    }

    const sortedPurchases = buyersPurchases.sort(
      (a: any, b: any) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );

    await this.auditLogService.log({
      logCategory: LogCategory.PURCHASE,
      description: 'find purchase',
      details: {
        buyerId,
        purchases: sortedPurchases.length.toString(),
      },
    });

    return {
      data: sortedPurchases,
      total: sortedPurchases.length,
      page,
      limit,
    };
  };

  findPurchasesByProductId = async (
    findPurchaseByIdInterface: FindPurchaseByIdInterface,
  ): Promise<PaginatedPurchaseResponse> => {
    const { productId, dealerId, page, limit } = findPurchaseByIdInterface;
    const purchases = await this.purchaseRepository.findRawPurchases(
      parseInt(page),
      parseInt(limit),
    );

    if (purchases.data.length === 0) {
      this.logger.warn(`no purchases for product ${productId}`);
      throw new NotFoundException('there are no purchases');
    }

    const productPurchases = purchases.data
      .filter((purchase) => purchase.productId === productId)
      .sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime(),
      );

    if (productPurchases.length === 0) {
      this.logger.warn(`no purchases for product ${productId}`);
      throw new NotFoundException('there are no purchases');
    }

    this.logger.log(
      `dealer ${dealerId} successfully fetched product ${productId}`,
    );

    await this.auditLogService.log({
      logCategory: LogCategory.PURCHASE,
      description: 'find purchase',
      details: {
        productId,
        dealerId,
        purchases: productPurchases.length.toString(),
      },
    });

    return {
      data: productPurchases,
      total: productPurchases.length,
      page,
      limit,
    };
  };

  findPurchases = async (
    purchasesFilterDto: PurchaseFilterDto,
  ): Promise<{
    data: PurchaseResponse[];
    total: number;
    currentPage: number;
  }> => {
    const {
      search,
      priceType,
      cylinder,
      purchaseType,
      purchaseDate,
      skip,
      take,
    } = purchasesFilterDto;

    const purchaseFilter: PurchaseFilterInterface = {
      ...(search !== undefined && { search }),
      ...(priceType !== undefined && { priceType: priceType as PriceType }),
      ...(cylinder !== undefined && { cylinder: cylinder as CylinderType }),
      ...(purchaseType !== undefined && {
        purchaseType: purchaseType as PurchaseType,
      }),
      ...(purchaseDate !== undefined && { purchaseDate }),
      skip,
      take,
    };

    try {
      const { purchases, total }: PurchaseResObj =
        await this.purchaseRepository.findPurchases(purchaseFilter);

      if (!purchases) {
        this.logger.warn('purchases not found');
        throw new NotFoundException('purchases not found');
      }

      this.logger.verbose('purchases fetched successfully');

      await this.auditLogService.log({
        logCategory: LogCategory.PURCHASE,
        description: 'find purchases',
        details: {
          purchases: purchases.length.toString(),
        },
      });

      return {
        data: purchases,
        total,
        currentPage: skip,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.log(error);
      this.logger.error('error fetching purchases');
      throw new InternalServerErrorException(
        'an error occurred, please try again',
      );
    }
  };

  findPurchasesForStat = async (adminId: string) => {
    const purchases = await this.purchaseRepository.getPurchaseStats();

    this.auditLogService.log({
      logCategory: LogCategory.PURCHASE,
      description: 'find purchases',
      details: {
        purchases: JSON.stringify(purchases),
        adminId,
      },
    });
    this.logger.log('purchases for stats fetched by', adminId);
    return purchases;
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

        await this.auditLogService.log({
          logCategory: LogCategory.PURCHASE,
          description: 'find purchases',
          details: {
            purchaseId,
            buyerId,
          },
        });

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

  pickupPurchase = async (driverId: string, purchaseId) => {
    const purchase = await this.purchaseRepository.findPurchaseById(purchaseId);
    const metadata = { ...purchase.metadata };

    metadata.pickedUp = new Date().toLocaleString();
    metadata.purchaseStatus = 'picked up';

    const pickedUpPurchase = await this.purchaseRepository.updatePurchase(
      purchaseId,
      {
        metadata,
      },
    );

    if (pickedUpPurchase) {
      await this.auditLogService.log({
        logCategory: LogCategory.PURCHASE,
        description: 'deliver purchases',
        details: {
          purchaseId,
          driverId,
        },
      });
      this.logger.log(`purchase ${purchaseId} successfully picked up`);
      return { Ok: true };
    } else {
      this.auditLogService.error({
        logCategory: LogCategory.PURCHASE,
        description: 'deliver purchases',
        details: {
          purchaseId,
          driverId,
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      this.logger.error(`failed to pickup purchase ${purchaseId}`);
      return { Ok: false };
    }
  };

  deliverPurchase = async (
    driverId: string,
    purchaseId: string,
    token: string,
    delivery: boolean,
  ): Promise<{ Ok: boolean }> => {
    const purchase = await this.purchaseRepository.findPurchaseById(purchaseId);

    await this.tokenService.verifyToken(
      purchase.metadata?.tokenId,
      token,
      purchase.purchaseId,
    );

    const metadata = { ...purchase.metadata };
    metadata.delivery = delivery.toString();
    metadata.deliveryDate = new Date().toLocaleDateString();
    metadata.purchaseStatus = 'delivered';

    const deliverPurchase = await this.purchaseRepository.updatePurchase(
      purchaseId,
      {
        metadata,
      },
    );

    // update driver metadata total number of purchases and total amount

    if (deliverPurchase) {
      await this.auditLogService.log({
        logCategory: LogCategory.PURCHASE,
        description: 'deliver purchases',
        details: {
          purchaseId,
          driverId,
          delivery: delivery.toString(),
        },
      });
      return { Ok: true };
    } else {
      return { Ok: false };
    }
  };

  verifyPurchaseToken = async () => {};

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

      await this.auditLogService.log({
        logCategory: LogCategory.PURCHASE,
        description: 'delete purchase',
        details: {
          purchaseId,
          buyerId,
        },
      });

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
      deliveryFee: purchaseResponse.deliveryFee,
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
            ${
              purchase.accessories.length > 0
                ? `accessories: ${purchase.accessories.length}`
                : ''
            },
            purchase type: ${purchaseType},
            cylinder type: ${cylinderType},
            price: ${price}`,
        address: buyer.address,
        location: buyer.location,
        metadata: {
          pushNotification: true,
        },
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
      metadata: {
        pushNotification: true,
      },
    };
  };

  private async verifyAccessories(accessoryIds: string[], buyer: BuyerEntity) {
    const accessories = await Promise.all(
      accessoryIds.map(async (accessory) => {
        const response = await this.accessoryService.findAccessoryById(
          accessory,
          buyer,
        );
        if (!response) {
          this.logger.error(`accessory with id ${accessory} not found`);
          throw new NotFoundException(`accessory ${accessory} not found`);
        }
        return response;
      }),
    );
    return {
      data: accessories,
      message: 'accessories verified successfully',
    };
  }
}
