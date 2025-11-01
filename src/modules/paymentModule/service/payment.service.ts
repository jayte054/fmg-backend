import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  InitializePaymentDto,
  PaymentFilterDto,
  RevenueFilterDto,
  UpdatePaymentDto,
} from '../utils/payment.dto';
import { ConfigService } from '@nestjs/config';
import { ProductService } from '../../ProductModule/productService/product.service';
import { firstValueFrom } from 'rxjs';
import { IPaymentRepository } from '../interface/IPaymentRepository';
import { ISubAccountRepository } from '../interface/ISubAccountRepository';
import { IWalletRepository } from '../interface/IWalletRepository';
import { WalletEntity } from '../entity/wallet.entity';
import {
  ActivateSubAccountInterface,
  AdminPaymentFilter,
  BuyerPaymentResponseInterface,
  BuyerWalletResponse,
  CashbackWalletFilter,
  CreateCashbackWalletResponse,
  CreateRevenueWalletInterface,
  PaginatedCashbackWalletResponse,
  PaymentFilter,
  PaymentStatus,
  PaystackTransactionData,
  RevenueFilter,
  RevenueWalletFilterInterface,
  RevenueWalletsFilterInterface,
  SubAccountResponse,
  TransactionFilterInterface,
  TransactionStatus,
  TransactionType,
  UpdateCashbackInputInterface,
  UpdateRevenueWalletInterface,
  UpdateWalletData,
  WalletFilter,
  WalletStatus,
  WalletUserEnum,
} from '../utils/interface';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';
import { DriverEntity } from '../../usersModule/userEntity/driver.entity';
import { MessagingService } from '../../notificationModule/notificationService/messaging.service';
import { SubAccountEntity } from '../entity/subaccount.entity';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { CashbackWalletEntity } from '../entity/cashback.entity';
import { ICashbackWalletRepository } from '../interface/ICashbackWallet.interface';
import { BuyerService } from 'src/modules/usersModule/service/buyer.service';
import { PaymentEntity } from '../entity/payment.entity';
import { IRevenueRepository } from '../interface/IRevenueRepository';
import { DuplicateException } from 'src/common/exceptions/exceptions';
import { DataSource, QueryRunner } from 'typeorm';
import { RevenueEntity } from '../entity/revenue.entity';
import { ITransactionRepositoryInterface } from '../interface/ITransactionrepository.interface';
import { TransactionEntity } from '../entity/transaction.entity';
import { RevenueWalletEntity } from '../entity/revenueWallet.entity';
import { IRevenueWalletRepository } from '../interface/IRevenueWalletRepository';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paystack_secret: string;
  private readonly paystack_url: string;
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,

    @Inject('ISubAccountRepository')
    private readonly subAccountRepository: ISubAccountRepository,

    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,

    @Inject('ICashbackWalletRepository')
    private readonly cashbackRepository: ICashbackWalletRepository,

    @Inject('IRevenueRepository')
    private readonly revenueRepository: IRevenueRepository,

    @Inject('ITransactionRepositoryInterface')
    private readonly transactionRepository: ITransactionRepositoryInterface,

    @Inject('IRevenueWalletRepository')
    private readonly revenueWalletRepo: IRevenueWalletRepository,

    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService,
    private readonly messagingService: MessagingService,
    private readonly buyerService: BuyerService,
    private readonly dataSource: DataSource,
    // @InjectQueue('payment')
    // private readonly paymentQueue: Queue,
  ) {
    this.paystack_secret = this.configService.get<string>(
      'paystack_test_secret_key',
    );
    this.paystack_url = this.configService.get<string>('paystack_url');
  }

  initializePayment = async (
    buyer: BuyerEntity,
    paymentDto: InitializePaymentDto,
  ) => {
    const { email } = buyer;
    const { purchase } = paymentDto;
    const paystack_secret = this.configService.get<string>(
      'paystack_test_secret_key',
    );
    const platform_code = this.configService.get<string>(
      'platform_sub_account_code',
    );
    const paystack_url = this.configService.get('paystack_url');

    const productAmount = parseFloat(purchase.price);
    const deliveryFee = parseFloat(purchase.deliveryFee);
    const totalAmount = productAmount + deliveryFee;

    const commissionOnDeliveryFee = deliveryFee * 0.3;
    const commissionOnProductFee = productAmount * 0.05;
    const platformCommission = commissionOnDeliveryFee + commissionOnProductFee;
    const driversShare = deliveryFee - commissionOnDeliveryFee;
    const dealerShare = productAmount - commissionOnProductFee;

    const amountInKobo = totalAmount * 100;
    const dealerShareInKobo = Math.floor(dealerShare * 100);
    const platformCommissionInKobo = Math.floor(platformCommission * 100);

    const { dealerId } = await this.productService.findProductByPurchaseService(
      purchase.productId,
    );
    const dealerSub =
      await this.subAccountRepository.findSubAccountUserId(dealerId);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${paystack_url}/transaction/initialize`,
          {
            email,
            amount: amountInKobo,
            split: {
              type: 'flat',
              currency: 'NGN',
              subaccounts: [
                {
                  subaccount: dealerSub.subAccountCode,
                  share: dealerShareInKobo,
                },
                {
                  subaccount: platform_code,
                  share: platformCommissionInKobo + driversShare * 100,
                },
              ],
            },
          },
          {
            headers: { Authorization: `Bearer ${paystack_secret}` },
          },
        ),
      );

      const authUrl = response.data?.data?.authorization_url;
      if (!authUrl) {
        this.auditLogService.error({
          logCategory: LogCategory.PAYMENT,
          email: buyer.email,
          description: 'payment initiation failed',
          details: {
            response: JSON.stringify(response),
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
        throw new InternalServerErrorException('failed to initialize payment');
      }

      const transactionInput: Partial<TransactionEntity> = {
        reference: response.data?.data?.reference,
        amount: totalAmount,
        location: buyer.location,
        type: TransactionType.debit,
        userId: buyer.buyerId,
        metadata: {
          purchase: JSON.stringify(purchase),
        },
      };
      await this.initiateTransaction(transactionInput);

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        email: buyer.email,
        description: 'payment initiated',
        details: {
          authUrl,
          reference: response.data?.data?.reference,
        },
      });

      return { authorizationUrl: authUrl };
    } catch (error) {
      throw new InternalServerErrorException('failed to initialize payment');
    }
  };

  async verifyPayment(
    buyer: BuyerEntity,
    reference: string,
  ): Promise<{ message: string }> {
    const url = `${this.paystack_url}/transaction/verify/${reference}`;
    const headers = { Authorization: `Bearer ${this.paystack_secret}` };

    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    const paymentData: PaystackTransactionData = response.data?.data;

    if (!paymentData) {
      throw new BadRequestException('No payment data returned from Paystack');
    }

    if (['failed', 'abandoned', 'reversed'].includes(paymentData.status)) {
      const input: Partial<TransactionEntity> = {
        status: TransactionStatus.failed,
        metadata: {
          status: paymentData.status,
          paymentVerified: true,
        },
      };
      await this.updateTransaction(input, reference);
      throw new BadRequestException('payment verification failed');
    }

    if (paymentData.status === 'processing') {
      const input: Partial<TransactionEntity> = {
        metadata: {
          note: 'Awaiting paystack confirmation',
        },
      };

      await this.updateTransaction(input, reference);

      await this.requeryPaymentVerification(reference);

      return { message: 'payment queued for re-verification' };
    }

    const input: Partial<TransactionEntity> = {
      status: TransactionStatus.processing,
      metadata: {
        status: paymentData.status,
        paymentVerified: true,
        verifiedAmount: paymentData.amount,
        channel: paymentData.channel,
        paidAt: paymentData.paid_at,
        ip: paymentData.ip_address,
        fees: paymentData.fees,
        subAccount: paymentData.subaccount,
        orderId: paymentData.order_id,
      },
    };

    await this.updateTransaction(input, reference);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'Payment verified and processed successfully',
      details: {
        reference,
        status: paymentData.status,
      },
    });

    return { message: 'payment verified successfully' };
  }

  requeryPaymentVerification = async (
    reference: string,
    retries = 3,
    delayMs = 10000,
  ) => {
    const url = `${this.paystack_url}/transaction/verify/${reference}`;
    const headers = { Authorization: `Bearer ${this.paystack_secret}` };
    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      const paymentData: PaystackTransactionData = response.data?.data;

      if (['failed', 'reversed'].includes(paymentData.status)) {
        const input: Partial<TransactionEntity> = {
          status: TransactionStatus.failed,
          metadata: {
            status: paymentData.status,
            paymentVerified: true,
          },
        };
        await this.updateTransaction(input, reference);

        return { message: 'payment verified successfully' };
      }

      if (paymentData.status === 'success') {
        const input: Partial<TransactionEntity> = {
          status: TransactionStatus.processing,
          metadata: {
            status: paymentData.status,
            paymentVerified: true,
            verifiedAmount: paymentData.amount,
            channel: paymentData.channel,
            paidAt: paymentData.paid_at,
            ip: paymentData.ip_address,
            fees: paymentData.fees,
            subAccount: paymentData.subaccount,
            orderId: paymentData.order_id,
          },
        };

        await this.updateTransaction(input, reference);

        this.auditLogService.log({
          logCategory: LogCategory.PAYMENT,
          description: 'Payment verified and processed successfully',
          details: {
            reference,
            status: paymentData.status,
          },
        });

        return { message: 'payment verified successfully' };
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }

    this.auditLogService.error({
      logCategory: LogCategory.PAYMENT,
      description: 'Payment verification timed out after all retries',
      details: { reference },
      status: HttpStatus.GATEWAY_TIMEOUT,
    });

    return { message: 'Payment verification timed out, please retry later' };
  };

  // when testin, test the commented updated payment method
  updatePayment = async (paymentDto: UpdatePaymentDto) => {
    const { reference, purchase, email, source } = paymentDto;
    const deliveryFee = parseFloat(purchase.deliveryFee);
    const productAmount = parseFloat(purchase.price);
    const totalAmount = deliveryFee + productAmount;

    const commissionOnDeliveryFee = deliveryFee * 0.3;
    const commissionOnProductFee = productAmount * 0.05;
    const platformCommission = commissionOnDeliveryFee + commissionOnProductFee;
    const driverShare = deliveryFee - commissionOnDeliveryFee;
    const dealerShare = productAmount - commissionOnProductFee;

    const [buyer, { dealerId }, transaction] = await Promise.all([
      this.buyerService.findBuyer(email),
      this.productService.findProductByPaymentService(purchase.productId),
      this.transactionRepository.findTransaction({ reference }),
    ]);

    const dealerSub =
      await this.subAccountRepository.findSubAccountUserId(dealerId);

    const driverId = purchase.metadata?.driverId;

    const [driverWallet, dealerWallet] = await Promise.all([
      this.walletRepository.findWalletUserId(driverId),
      this.walletRepository.findWalletUserId(dealerId),
    ]);

    if (!driverWallet || !dealerWallet) {
      throw new NotFoundException('Driver or Dealer wallet not found');
    }

    if (!dealerSub?.subAccountCode) {
      throw new NotFoundException('Dealer sub-account not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const driverMetadata = { ...driverWallet.metadata };
      const prevTransactions = driverMetadata.numberOfTransactions;
      const prevAmountTransacted =
        Number(driverMetadata.totalAmountTransacted) || 0;
      driverMetadata.numberOfTransactions =
        typeof prevTransactions === 'number' ? prevTransactions + 1 : 1;
      driverMetadata['totalAmountTransacted'] =
        prevAmountTransacted + driverShare;
      driverMetadata.lastTransactionDate = new Date().toISOString();
      if (!driverMetadata.driverId) {
        driverMetadata['driverId'] = driverId;
      }

      const updateDriverWalletData: UpdateWalletData = {
        balance: driverShare + driverWallet.balance,
        previousBalance: driverWallet.balance,
        metadata: driverMetadata,
        updatedAt: new Date(),
      };

      await queryRunner.manager.update(
        WalletEntity,
        driverWallet.walletAccount,
        updateDriverWalletData,
      );

      const dealerMetadata = { ...dealerWallet.metadata };
      const previous = Number(dealerMetadata.numberOfTransactions);
      const prevDealerAmount =
        Number(dealerMetadata.totalAmountTransacted) || 0;
      dealerMetadata.numberOfTransactions =
        typeof previous === 'number' ? previous + 1 : 1;
      dealerMetadata['totalAmountTransacted'] = prevDealerAmount + dealerShare;
      dealerMetadata.lastTransactionDate = new Date().toISOString();
      if (!dealerMetadata.dealerId) {
        dealerMetadata['dealerId'] = dealerId;
      }

      const updateDealerWalletData: UpdateWalletData = {
        balance: dealerShare + dealerWallet.balance,
        previousBalance: dealerWallet.balance,
        metadata: dealerMetadata,
        updatedAt: new Date(),
      };

      await queryRunner.manager.update(
        WalletEntity,
        dealerWallet.walletAccount,
        updateDealerWalletData,
      );

      const commonFields = {
        email: email,
        purchaseId: purchase.purchaseId,
        reference,
        amount: totalAmount,
        productAmount,
        deliveryFee,
        driverShare,
        dealerSubAccount: dealerSub.subAccountCode,
        dealersWalletAccount: dealerWallet.walletAccount,
        driversWalletAccount: driverWallet.walletAccount,
        status: PaymentStatus.paid,
        createdAt: new Date(),
        metadata: {},
      };

      //update buyer metadata
      const prevAmount = Number(buyer.data.metadata?.amountTransacted) || 0;
      const updatedBuyerMetadata = { ...buyer.data.metadata };
      updatedBuyerMetadata['amountTransacted'] = (
        prevAmount + totalAmount
      ).toString();

      let paymentRecord: PaymentEntity;
      let revenueRecord: RevenueEntity;

      if (buyer.data.metadata['cashbackWallet'] === 'true') {
        const amount = platformCommission * 0.01;
        const commission = platformCommission - amount;
        await this.updateCashbackMethod(amount.toString(), buyer.data.buyerId);

        [paymentRecord, revenueRecord] = await Promise.all([
          queryRunner.manager.save(PaymentEntity, {
            ...commonFields,
            platformCommission: commission,
          }),

          queryRunner.manager.save(RevenueEntity, {
            amount: commission.toString(),
            reference,
            source,
            recordedAt: new Date(),
          }),
        ]);
      } else {
        [paymentRecord, revenueRecord] = await Promise.all([
          queryRunner.manager.save(PaymentEntity, {
            ...commonFields,
            platformCommission,
          }),

          queryRunner.manager.save(RevenueEntity, {
            amount: platformCommission.toString(),
            reference,
            source,
            recordedAt: new Date(),
          }),
        ]);
      }

      await queryRunner.manager.update(BuyerEntity, buyer.data.buyerId, {
        metadata: updatedBuyerMetadata,
      });

      const updatedMetadata = {
        ...transaction.metadata,
        paymentId: paymentRecord.paymentId,
        revenueId: revenueRecord.revenueId,
        driverShare,
        dealerShare,
        platformCommission,
        driverId,
        dealerId,
      };

      const settlementTransaction = queryRunner.manager.create(
        TransactionEntity,
        {
          reference: `${reference}-settlement`,
          buyerId: buyer.data.buyerId,
          amount: totalAmount,
          status: TransactionStatus.success,
          type: TransactionType.settlement,
          revenueId: revenueRecord.revenueId,
          relatedTransactionid: transaction.transactionId,
          metadata: updatedMetadata,
        },
      );

      await queryRunner.manager.save(settlementTransaction);

      await queryRunner.manager.update(
        TransactionEntity,
        transaction.transactionId,
        {
          revenueId: revenueRecord.revenueId,
          status: TransactionStatus.success,
          metadata: updatedMetadata,
        },
      );
      await queryRunner.commitTransaction();

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Payment updated and processed successfully',
        email: email,
        details: {
          reference,
          dealerId,
          driverId,
          amount: totalAmount.toString(),
          revenueId: revenueRecord.revenueId,
        },
      });

      return paymentRecord;
    } catch (error) {
      //rollback everything if something fails
      await queryRunner.rollbackTransaction();
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'Payment transaction failed',
        email,
        details: { error: error.message, reference },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      throw new InternalServerErrorException(
        'An error occurred while processing the payment',
      );
    } finally {
      await queryRunner.release();
    }
  };

  createBuyerWallet = async (
    buyer: BuyerEntity,
  ): Promise<BuyerWalletResponse> => {
    const accExtension = Math.floor(100000 + Math.random() * 900000).toString();
    const walletAccount = `${buyer.buyerId.slice(0, 4)}-${accExtension}`;

    const input: Partial<WalletEntity> = {
      walletName: `${buyer.firstName} ${buyer.lastName}`,
      walletAccount,
      userId: buyer.userId,
      status: WalletStatus.active,
      type: WalletUserEnum.buyer,
      balance: 0,
      previousBalance: 0,
      createdAt: new Date(),
      metadata: {},
    };

    const newWallet = await this.walletRepository.createWallet(input);

    await this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'create new wallet',
      email: buyer.email,
      details: {
        walletName: newWallet.walletName,
        balance: newWallet.balance.toString(),
      },
    });

    return {
      message: 'wallet created successfully',
      status: HttpStatus.OK,
      wallet: newWallet,
    };
  };

  createWallet = async (
    walletInput: Partial<WalletEntity>,
    accountId: string,
    email: string,
    queryRunner?: QueryRunner,
  ): Promise<WalletEntity> => {
    const { walletName, userId, type } = walletInput;
    const accExtension = Math.floor(100000 + Math.random() * 900000).toString();
    const walletAccount = `${accountId}-${accExtension}`;
    const manager = queryRunner ? queryRunner.manager : this.dataSource.manager;

    const input: Partial<WalletEntity> = {
      walletName,
      walletAccount,
      userId,
      status: WalletStatus.active,
      type,
      balance: 0,
      previousBalance: 0,
      createdAt: new Date(),
      metadata: {},
    };

    const newWallet = await manager.save(WalletEntity, input);

    await this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'create new wallet',
      email,
      details: {
        walletName,
        balance: newWallet.balance.toString(),
      },
    });

    return newWallet;
  };

  updateBankDetail = async (
    accountNumber: string,
    bankName: string,
    accountName: string,
    driver: DriverEntity,
  ) => {
    const { driverId, email } = driver;
    const wallet = await this.walletRepository.findWalletUserId(driverId);

    if (!wallet) {
      this.logger.warn(`wallet for driver ${driverId} does not exist`);
      throw new NotFoundException('wallet not found');
    }
    const { metadata, walletId } = wallet;
    metadata['bankName'] = {
      bankName,
      accountNumber,
      accountName,
    };
    metadata['numberOfTransactions'] =
      typeof metadata['numberOfTransactions'] === 'number'
        ? metadata['numberOfTransactions']
        : 0;

    const updateWalletData: UpdateWalletData = {
      metadata,
      updatedAt: new Date(),
    };

    const updateWallet = await this.walletRepository.updateWallet(
      wallet.walletAccount,
      updateWalletData,
    );

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'create new wallet',
      email,
      details: {
        walletId,
      },
    });
    this.logger.log(`wallet with driverId ${driverId} updated successfully`);
    return updateWallet;
  };

  // withdrawFromWallet = async (
  //   amount: number,
  //   driver: DriverEntity,
  // ): Promise<{ wallet?: WalletEntity; message?: string }> => {
  //   const request_number = this.configService.get<string>(
  //     'platform_whithdrawal_request_number',
  //   );
  //   const { driverId, email } = driver;

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   const wallet = await this.walletRepository.findWalletUserId(driverId);
  //   if (wallet.balance < amount) {
  //     this.logger.error(`insufficient balance for driver ${driverId}`);
  //     return { message: 'insufficient balance' };
  //   }

  //   if (wallet.userId !== driverId) {
  //     this.logger.error('unauthorized withdrawal access');
  //     return { message: 'unauthorized' };
  //   }

  //   const bankDetails = wallet.metadata?.bankName as {
  //     bankName: string;
  //     accountName: string;
  //     accountNumber: string;
  //   };

  //   if (!bankDetails?.accountNumber || !bankDetails.accountName) {
  //     this.logger.error(
  //       `missing bank details in driver ${driver.driverId} wallet`,
  //     );
  //     throw new Error('Missing bank details in wallet metadata');
  //   }

  //   const newBalance = wallet.balance - amount;

  //   const metadata = wallet.metadata;
  //   const currentWithdrawals = metadata.numberOfWithdrawals;
  //   metadata.numberOfWithdrawals =
  //     typeof currentWithdrawals === 'number' ? currentWithdrawals + 1 : 1;
  //   const totalAmountWithdrawn = metadata.totalAmountWithdrawn;
  //   metadata.totalAmountWithdrawn =
  //     typeof totalAmountWithdrawn === 'number'
  //       ? totalAmountWithdrawn + amount
  //       : amount;

  //   const updateWalletData: UpdateWalletData = {
  //     ...wallet,
  //     balance: newBalance,
  //     previousBalance: wallet.balance,
  //     metadata,
  //     updatedAt: new Date(),
  //   };

  //   const updatedWallet = await this.walletRepository.updateWallet(
  //     wallet.walletAccount,
  //     updateWalletData,
  //   );

  //   if (updatedWallet) {
  //     this.auditLogService.log({
  //       logCategory: LogCategory.PAYMENT,
  //       description: 'Driver wallet withdrawal successful',
  //       email,
  //       details: {
  //         amount: amount.toString(),
  //         newBalance: newBalance.toString(),
  //       },
  //     });

  //     //include a transaction query to the database

  //     await this.messagingService.sendWithdrawalRequest(
  //       request_number,
  //       `
  //         driver ${driver.firstName} ${driver.lastName} has requested a withdrawal into
  //         Account Name: ${bankDetails.accountName}
  //         Account Number: ${bankDetails.accountNumber}
  //         Bank Name: ${bankDetails.bankName}
  //         Amount: ${amount}
  //         `,
  //       driverId,
  //       amount.toString(),
  //       wallet.walletId,
  //     );

  //     this.logger.log(
  //       `Withdrawal of ${amount} from driver ${driverId} successful`,
  //     );
  //     return {
  //       wallet: updatedWallet,
  //       message: 'withdrawal process successfully initiated',
  //     };
  //   } else {
  //     this.auditLogService.log({
  //       logCategory: LogCategory.PAYMENT,
  //       description: 'Driver wallet withdrawal unsuccessful',
  //       email,
  //       details: {
  //         amount: amount.toString(),
  //         newBalance: newBalance.toString(),
  //       },
  //     });

  //     this.logger.error('failed to implement withdrawal');
  //     return { message: 'failed to implement withdrawal' };
  //   }
  // };

  withdrawFromWallet = async (
    amount: number,
    driver?: DriverEntity,
    dealer?: DealerEntity,
  ): Promise<{ wallet?: WalletEntity; message?: string }> => {
    const request_number = this.configService.get<string>(
      'platform_whithdrawal_request_number',
    );

    let userId: string;
    let email: string;

    switch (true) {
      case !!driver:
        userId = driver.userId;
        email = driver.email;
        break;

      case !!dealer:
        userId = dealer.userId;
        email = dealer.email;

      default:
        this.logger.error('invalid request');
        this.auditLogService.error({
          logCategory: LogCategory.PAYMENT,
          description: 'failed to provide valid entity',
          details: {
            userId,
            amount: amount.toString(),
          },
          status: HttpStatus.BAD_REQUEST,
        });
        throw new BadRequestException('invalid request');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { userId },
        lock: { mode: 'pessimistic_write' }, // prevent concurrent modification
      });

      if (!wallet) {
        throw new Error(`Wallet not found for driver ${userId}`);
      }

      if (wallet.balance < amount) {
        this.logger.error(`Insufficient balance for driver ${userId}`);
        await queryRunner.rollbackTransaction();
        return { message: 'insufficient balance' };
      }

      if (wallet.userId !== userId) {
        this.logger.error('Unauthorized withdrawal access');
        await queryRunner.rollbackTransaction();
        return { message: 'unauthorized' };
      }

      const bankDetails = wallet.metadata?.bankName as {
        bankName: string;
        accountName: string;
        accountNumber: string;
      };

      if (!bankDetails?.accountNumber || !bankDetails.accountName) {
        this.logger.error(
          `Missing bank details in driver ${driver.driverId} wallet`,
        );
        throw new Error('Missing bank details in wallet metadata');
      }

      // Update wallet balance and metadata
      const availableBalance = wallet.balance - wallet.lienBalance;

      if (amount < availableBalance) {
        this.logger.error(
          'insufficient balance',
          'payment',
          'withdraw from wallet',
        );
        throw new ConflictException('insufficient balance');
      }
      const newBalance = wallet.balance - amount;
      const metadata = wallet.metadata;

      metadata.numberOfWithdrawals =
        typeof metadata.numberOfWithdrawals === 'number'
          ? metadata.numberOfWithdrawals + 1
          : 1;

      metadata.totalAmountWithdrawn =
        typeof metadata.totalAmountWithdrawn === 'number'
          ? metadata.totalAmountWithdrawn + amount
          : amount;

      wallet.previousBalance = wallet.balance;
      wallet.balance = newBalance;
      wallet.metadata = metadata;
      wallet.updatedAt = new Date();

      await queryRunner.manager.save(wallet);

      // Optional: Record the transaction in the transactions table
      const transaction = queryRunner.manager.create(TransactionEntity, {
        reference: `WD-${userId.slice(0, 3)}-${Date.now()}`,
        userId: userId,
        amount,
        status: TransactionStatus.processing,
        type: TransactionType.debit,
        metadata: {
          bankDetails,
          previousBalance: wallet.previousBalance,
          newBalance: wallet.balance,
        },
      });
      await queryRunner.manager.save(transaction);

      // Commit all DB operations before external messaging
      await queryRunner.commitTransaction();

      // Send notification message (outside transaction)
      await this.messagingService.sendWithdrawalRequest(
        request_number,
        `
          Driver ${driver.firstName} ${driver.lastName} has requested a withdrawal:
          Account Name: ${bankDetails.accountName}
          Account Number: ${bankDetails.accountNumber}
          Bank Name: ${bankDetails.bankName}
          Amount: ${amount}
        `,
        userId,
        amount.toString(),
        wallet.walletId,
      );

      // Log audit
      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Driver wallet withdrawal successful',
        email,
        details: {
          amount: amount.toString(),
          newBalance: newBalance.toString(),
        },
      });

      this.logger.log(
        `Withdrawal of ${amount} from driver ${userId} successful`,
      );
      return {
        wallet,
        message: 'withdrawal process successfully initiated',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Withdrawal failed', error.stack);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'Driver wallet withdrawal failed',
        email: driver.email,
        details: { userId, amount: amount.toString(), error: error.message },
        status: HttpStatus.BAD_REQUEST,
      });
      return { message: 'withdrawal failed' };
    } finally {
      await queryRunner.release();
    }
  };

  getWallets = async (adminId: string, filter: WalletFilter) => {
    const { search, status, type, createdAt, skip, take } = filter;

    const walletFilter = {
      ...(search !== undefined && { search }),
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
      ...(createdAt !== undefined && { createdAt }),
      skip,
      take,
    };

    const wallets = await this.walletRepository.findWallets(walletFilter);

    this.logger.log(`wallets fetched by ${adminId}`);
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'wallets fetched by admin',
      details: {
        adminId,
        filter: JSON.stringify(walletFilter),
      },
    });

    return wallets;
  };

  getWalletByAdmin = async (adminId: string, walletId: string) => {
    if (!walletId) {
      this.logger.error('userId not included in request');
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'fetch user wallet',
        details: {
          adminId,
          walletId,
        },
        status: HttpStatus.BAD_REQUEST,
      });
      throw new BadRequestException('walletId not included');
    }

    const userWallet = await this.walletRepository.findWallet(walletId);

    if (!userWallet) {
      this.logger.error(`wallet with walletId ${walletId} not found`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'fetch wallet',
        details: {
          adminId,
          walletId,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException('wallet not found');
    }

    this.logger.log(
      `wallet ${walletId} fetched successfully by admin ${adminId}`,
    );
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'fetch wallet by walletId',
      details: {
        adminId,
        walletId,
      },
    });

    return {
      message: 'wallet fetched successfully',
      status: HttpStatus.FOUND,
      data: userWallet,
    };
  };

  getWallet = async (
    buyer?: BuyerEntity,
    driver?: DriverEntity,
    dealer?: DealerEntity,
  ) => {
    let userId: string;
    let role: string;

    switch (true) {
      case !!buyer:
        userId = buyer.userId;
        role = 'buyer';
        break;

      case !!driver:
        userId = driver.userId;
        role = 'driver';
        break;

      case !!dealer:
        userId = dealer.userId;
        role = 'dealer';
        break;

      default:
        this.logger.error('failed to provide a valid id');
        this.auditLogService.error({
          logCategory: LogCategory.PAYMENT,
          description: 'fetch wallet',
          details: {
            userId,
          },
          status: HttpStatus.NOT_FOUND,
        });
        throw new BadRequestException('invalid request');
    }

    const wallet = await this.walletRepository.findWalletUserId(userId);

    if (!wallet) {
      this.logger.error('failed to fetch wallet with userId', userId);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'failed to fetch wallet',
        details: {
          userId,
          role,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException(`wallet with userId ${userId} not found`);
    }

    this.logger.log('wallet fetched successfully');
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: `${role} with id ${userId} fetched wallet`,
      details: {
        userId,
        walletId: wallet.walletId,
        role,
      },
    });

    return {
      message: 'wallet fetched successfully',
      status: HttpStatus.FOUND,
      wallet: WalletEntity,
    };
  };

  getWalletStats = async (adminId: string, type: WalletUserEnum) => {
    const stats = await this.walletRepository.getWalletStats(type);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetch wallet Stats',
      details: {
        adminId,
        stats: JSON.stringify(stats),
      },
    });

    return stats;
  };

  createSubAccount = async (
    subAccountInput: Partial<SubAccountEntity>,
    name: string,
    email: string,
    dealerId: string,
    queryRunner?: QueryRunner,
  ): Promise<SubAccountResponse | { message: string }> => {
    const manager = queryRunner ? queryRunner.manager : this.dataSource.manager;
    const { userId, bankName, walletId, bankCode, accountNumber } =
      subAccountInput;

    if (!userId || !bankCode || !accountNumber || !walletId) {
      this.logger.warn('Missing required fields to create subaccount');
      return { message: 'Missing required input for subaccount creation' };
    }

    const paystack_secret = this.configService.get('paystack_test_secret_key');
    const paystack_url = this.configService.get<string>('paystack_url');

    const headers = {
      Authorization: `Bearer ${paystack_secret}`,
      'Content-Type': 'application/json',
    };

    const body = {
      business_name: name,
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: 100,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${paystack_url}/subaccount`, body, {
          headers,
        }),
      );

      const responseData = response.data?.data;
      console.log(responseData);

      if (!responseData || !responseData.subaccount_code) {
        this.logger.error('failed to create subaccount code');
        this.auditLogService.log({
          logCategory: LogCategory.PAYMENT,
          description: `failed to create subaccount for dealer ${userId}`,
          email,
          details: {
            name,
          },
        });
        throw new InternalServerErrorException('failed to create subaccount');
      }
      const newSubAccount = await manager.save(SubAccountEntity, {
        userId,
        subAccountCode: responseData.subaccount_code,
        bankName,
        accountNumber,
        walletId,
        bankCode,
        createdAt: new Date(),
        metadata: {
          dealerId,
          active: 'false',
        },
      });

      if (!newSubAccount) {
        this.logger.error('failed to create subAccount');
        return { message: 'failed to create sub account' };
      }

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: `sub account created successfully`,
        email,
        details: {
          name,
        },
      });

      this.logger.log(`sub account for user ${name} created successfully`);

      return {
        sub_account: newSubAccount,
        message: 'sub account created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'failed to create subaccount',
        error,
      );
    }
  };

  activateSubAccount = async (
    dealer: DealerEntity,
    // admin: AdminEntity,
    subAccountInterface: ActivateSubAccountInterface,
  ) => {
    const {
      business_name,
      bank_code,
      account_number,
      active,
      subaccount_code,
    } = subAccountInterface;

    const account = await this.subAccountRepository.findSubAccountUserId(
      dealer.dealerId,
    );

    if (!account || account.subAccountCode !== subaccount_code) {
      this.logger.error(
        'unauthorized access to account by dealerId',
        dealer.dealerId,
      );
      throw new UnauthorizedException('unauthorized access');
    }

    const { metadata } = account;

    if (metadata.dealerId !== dealer.dealerId) {
      this.logger.error(
        'unauthorized access to account by dealerId',
        dealer.dealerId,
      );
      throw new UnauthorizedException('unauthorized access');
    }

    const paystack_secret = this.configService.get('paystack_test_secret_key');
    const paystack_url = this.configService.get<string>('paystack_url');

    const headers = {
      Authorization: `Bearer ${paystack_secret}`,
      'Content-Type': 'application/json',
    };

    try {
      const body = {
        business_name,
        bank_code,
        account_number,
        active,
      };
      const response = await firstValueFrom(
        this.httpService.put(
          `${paystack_url}/subaccount/${subaccount_code}`,
          body,
          {
            headers,
          },
        ),
      );

      const responseData = response.data.data;

      metadata.active = 'true';
      metadata['updatedActiveStatusDate'] = new Date().toISOString();

      const subAccount = await this.subAccountRepository.updateSubAccount(
        subaccount_code,
        metadata,
      );

      if (typeof subAccount === 'string') {
        throw new InternalServerErrorException(subAccount);
      }

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: `sub account created successfully`,
        email: dealer.email,
        details: {
          subaccount_code,
          active: responseData.active,
          id: responseData.id,
          accountName: responseData.account_name,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        },
      });

      this.logger.log('sub account activated successfully');
      return responseData;
    } catch (error) {
      if (error.status === 500) {
        this.logger.error('paystack error with error', 500);
        throw new InternalServerErrorException(
          'failed to activate account on paystack',
        );
      }
      this.logger.error('failed to activate subaccount');
      throw new InternalServerErrorException('failed to activate subaccount');
    }
  };

  createCashbackWallet = async (
    buyer: BuyerEntity,
  ): Promise<CreateCashbackWalletResponse> => {
    const { buyerId, firstName, lastName, email } = buyer;
    const accExtension = Math.floor(100000 + Math.random() * 900000).toString();
    const accountNumber = `${firstName.slice(2)}${accExtension}${lastName.slice(2)}`;

    const input: Partial<CashbackWalletEntity> = {
      username: `${firstName} ${lastName}`,
      userId: buyerId,
      accountNumber,
      isActive: true,
      balance: '0',
      metadata: {
        numberOfTransactions: 0,
        email,
      },
    };

    const duplicateWallet =
      await this.cashbackRepository.findCashbackWalletByUserId(buyer.userId);

    if (duplicateWallet) {
      this.logger.error(
        'cashback wallet already exists for user ',
        buyer.buyerId,
      );
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        email: buyer.email,
        description: 'duplicate wallet',
        details: {
          userId: buyer.userId,
        },
        status: HttpStatus.CONFLICT,
      });
      throw new DuplicateException('wallet already exists');
    }

    const cashbackWallet =
      await this.cashbackRepository.createCashbackWallet(input);

    const saidBuyer = await this.buyerService.findBuyer(buyer.userId);
    saidBuyer.data.metadata = {
      cashbackWallet: 'true',
    };
    await this.buyerService.saveBuyer(saidBuyer.data);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: `cashback wallet created for user ${buyerId}`,
      email,
      details: {
        buyerId,
        accountNumber,
      },
    });

    this.logger.log(`cashback wallet for id ${buyerId} created successfully`);
    return {
      message: 'cashback wallet created successfully',
      status: '200',
      data: cashbackWallet,
    };
  };

  findCashbackWallets = async (
    adminId: string,
    filter: CashbackWalletFilter,
  ): Promise<PaginatedCashbackWalletResponse> => {
    const { search, isActive, createdAt, skip, take } = filter;

    const inputFilter = {
      ...(search !== undefined && { search }),
      ...(isActive !== undefined && { isActive }),
      ...(createdAt !== undefined && { createdAt }),
      skip: skip ?? 0,
      take: take ?? 20,
    } as CashbackWalletFilter;

    const wallets =
      await this.cashbackRepository.findCashbackWallets(inputFilter);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'cashback wallets fetched by admin',
      details: {
        total: wallets.total.toString(),
        adminId,
      },
    });

    this.logger.log('cashback wallets successfully fetched');
    return wallets;
  };

  findCashbackWallet = async (
    walletId: string,
  ): Promise<CashbackWalletEntity> => {
    if (!walletId) throw new BadRequestException('walletId is not defined');

    const wallet = await this.cashbackRepository.findCashbackWallet(walletId);

    if (!wallet) {
      this.logger.error(`wallet with id ${walletId} does not exist`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: `failed to find wallet ${walletId}`,
        status: HttpStatus.NOT_FOUND,
        details: {
          walletId,
        },
      });
      throw new NotFoundException('wallet not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'wallet successfully fetched',
      details: {
        walletId,
      },
    });

    return wallet;
  };

  findWalletByBuyerId = async (
    buyer: BuyerEntity,
  ): Promise<CashbackWalletEntity> => {
    const { buyerId, email } = buyer;

    const wallet =
      await this.cashbackRepository.findCashbackWalletByUserId(buyerId);

    if (!wallet) {
      this.logger.error(`cashback wallet for user ${buyerId} not found`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'cashback wallet not found',
        email,
        status: HttpStatus.NOT_FOUND,
        details: {
          user: email,
        },
      });
      throw new NotFoundException('wallet not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'wallet successfully fetched',
      email,
      details: {
        buyerId,
        walletId: wallet.walletId,
      },
    });
    return wallet;
  };

  private updateCashbackMethod = async (amount: string, buyerId: string) => {
    const wallet =
      await this.cashbackRepository.findCashbackWalletByUserId(buyerId);
    const prev = (wallet.metadata?.numberOfTransactions as number) ?? 0;
    const previousBalance = wallet.balance;
    wallet.metadata['numberOfTransactions'] = prev + 1;
    const balance = parseFloat(previousBalance) + parseFloat(amount);
    wallet.balance = String(balance);

    await this.updateCashbackWallet(
      wallet.walletId,
      {
        balance: wallet.balance,
        metadata: wallet.metadata,
      },
      previousBalance,
    );

    return 'update successful';
  };

  updateCashbackWallet = async (
    walletId: string,
    updateCashbackInput: UpdateCashbackInputInterface,
    previousBalance?: string,
  ): Promise<CashbackWalletEntity> => {
    const updateWallet = await this.cashbackRepository.updateCashbackWallet(
      walletId,
      updateCashbackInput,
    );

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'cashback wallet updated successfully',
      details: {
        walletId,
        previousBalance,
        data: JSON.stringify(updateCashbackInput),
      },
    });
    this.logger.log(`cashback wallet ${walletId} updated successfully`);

    return updateWallet;
  };

  getCashbackStats = async (adminId: string) => {
    const stats = await this.cashbackRepository.getCashbackWalletStats();

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'cashback wallet stats',
      details: {
        adminId,
      },
    });
    this.logger.log('cashback wallet stats fetched successfully');

    return stats;
  };

  findPayment = async (buyer: BuyerEntity, paymentId: string) => {
    const { email, buyerId } = buyer;
    const payment = await this.paymentRepository.findPayment(paymentId);

    if (!payment) {
      this.logger.error(`failed to find payment with payment Id ${paymentId}`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'failed to find payment',
        email,
        details: {
          paymentId,
          buyerId,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException('failed to find payment');
    }

    if (payment.email !== email) {
      this.logger.error('buyer not authorized to view payment');
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'unauthorized access',
        email,
        details: {
          paymentId,
          buyerId: buyer.buyerId,
        },
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'payment successfully found',
      email: buyer.email,
      details: {
        paymentId,
        buyer: buyer.buyerId,
      },
    });

    this.logger.log('payment successfully retrieved');
    return this.mapToBuyerPaymentResponse(payment);
  };

  findPaymentByAdmin = async (adminId: string, paymentId: string) => {
    const payment = await this.paymentRepository.findPayment(paymentId);

    if (!payment) {
      this.logger.error(`failed to find payment with payment Id ${paymentId}`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'failed to find payment',
        details: {
          paymentId,
          adminId,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException('failed to find payment');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'payment successfully found',
      details: {
        paymentId,
        buyer: payment.email,
        adminId,
      },
    });

    this.logger.log('payment successfully retrieved');
    return this.mapToBuyerPaymentResponse(payment);
  };

  findPayments = async (
    buyer: BuyerEntity,
    paymentFilter: PaymentFilterDto,
  ) => {
    const { userId, search, createdAt, status, skip, take } = paymentFilter;
    const filter: PaymentFilter = {
      userId,
      ...(search !== undefined && { search }),
      ...(createdAt !== undefined && { createdAt: new Date(createdAt) }),
      ...(status !== undefined && { status }),
      skip,
      take,
    };

    const payments = await this.paymentRepository.findPayments(filter);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'payments retrieved by buyer',
      email: buyer.email,
      details: {
        count: payments.total.toString(),
        buyer: buyer.buyerId,
      },
    });

    this.logger.log('payments successfully retrieved by buyer', buyer.buyerId);
    return payments;
  };

  findPaymentsByAdmin = async (
    adminId: string,
    paymentFilter: AdminPaymentFilter,
  ) => {
    const { search, createdAt, status, skip, take } = paymentFilter;
    const filter: AdminPaymentFilter = {
      ...(search !== undefined && { search }),
      ...(createdAt !== undefined && { createdAt: new Date(createdAt) }),
      ...(status !== undefined && { status }),
      skip,
      take,
    };

    const payments = await this.paymentRepository.findPaymentsByAdmin(filter);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'payments retrieved by buyer',
      details: {
        count: payments.total.toString(),
        adminId,
      },
    });

    this.logger.log('payments successfully retrieved by admin', adminId);
    return payments;
  };

  private mapToBuyerPaymentResponse = (
    payment: PaymentEntity,
  ): BuyerPaymentResponseInterface => {
    return {
      paymentId: payment.paymentId,
      email: payment.email,
      purchaseId: payment.purchaseId,
      reference: payment.reference,
      amount: payment.amount,
      productAmount: payment.productAmount,
      deliveryFee: payment.deliveryFee,
      status: payment.status,
      createdAt: payment.createdAt.toLocaleString(),
      metadata: payment.metadata,
    };
  };

  fetchRevenues = async (adminId: string, filterDto: RevenueFilterDto) => {
    const { search, isReversed, recordedAt, skip, take } = filterDto;

    const filter: RevenueFilter = {
      ...(search !== undefined && { search }),
      ...(isReversed !== undefined && { isReversed }),
      ...(recordedAt !== undefined && { recordedAt }),
      skip,
      take,
    };

    const revenues = await this.revenueRepository.fetchRevenues(filter);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'fetched a list a revenues',
      details: {
        adminId,
        filter: JSON.stringify(filter),
        count: revenues.total.toString(),
      },
    });

    this.logger.log('revenues fetched successfully');
    return revenues;
  };

  fetchRevenue = async (adminId: string, revenueId: string) => {
    const revenue = await this.revenueRepository.fetchRevenue(revenueId);

    if (!revenue) {
      this.logger.log(`revenue with id ${revenueId} does not exist`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: `revenue with id ${revenueId} does not exist`,
        details: {
          adminId,
          revenueId,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException('revenue not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: `revenue with id ${revenueId} ffetched successfully`,
      details: {
        adminId,
        revenueId,
      },
    });

    this.logger.log(`revenue ${revenueId} fetched successfully`);
    return revenue;
  };

  calculateRevenue = async (adminId: string) => {
    const totalRevenue = await this.revenueRepository.getTotalRevenue();

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: `revenue calculation fetched successfully`,
      details: {
        adminId,
      },
    });
    this.logger.log('revenue calculation fetched successfully');
    return {
      message: 'revenue fetched successfully',
      data: totalRevenue,
    };
  };

  initiateTransaction = async (
    transactionInput: Partial<TransactionEntity> | Partial<TransactionEntity>[],
  ) => {
    if (Array.isArray(transactionInput)) {
      this.checkDuplicateTransaction(transactionInput[0].reference);

      const inputArray = transactionInput.map((trx) => ({
        ...trx,
        status: TransactionStatus.pending,
      }));

      const transactions =
        await this.transactionRepository.createTransaction(inputArray);

      if (Array.isArray(transactions)) {
        for (const trx of transactions) {
          this.auditLogService.log({
            logCategory: LogCategory.PAYMENT,
            description: 'transaction initialized',
            details: {
              id: trx.transactionId,
            },
          });
        }
      }

      return transactions;
    }
    this.checkDuplicateTransaction(transactionInput.reference);
    const input: Partial<TransactionEntity> = {
      ...transactionInput,
      status: TransactionStatus.pending,
    };

    const transaction =
      await this.transactionRepository.createTransaction(input);

    if (!Array.isArray(transaction)) {
      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'transaction initialized',
        details: {
          id: transaction.transactionId,
        },
      });
    }

    return transaction;
  };

  private checkDuplicateTransaction = async (reference: string) => {
    if (!reference) {
      throw new BadRequestException('Transaction reference is required');
    }

    const transaction = await this.transactionRepository.findTransaction({
      reference,
    });

    if (transaction) {
      throw new DuplicateException('transaction already exists', { reference });
    }

    return;
  };

  fetchTransactions = async (
    adminId: string,
    filter: TransactionFilterInterface,
  ) => {
    const { search, type, status, createdAt, skip, take } = filter;
    const transactionFilter: TransactionFilterInterface = {
      ...(search !== undefined && { search }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(location !== undefined && { location }),
      ...(createdAt !== undefined && { createdAt }),
      skip,
      take,
    };

    const transactions =
      await this.transactionRepository.findTransactions(transactionFilter);

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'fetch transactions',
      details: {
        adminId,
        transactionFilter: JSON.stringify(transactionFilter),
      },
    });

    return transactions;
  };

  fetchTransaction = async (adminId: string, transactionId: string) => {
    const transaction = await this.transactionRepository.findTransaction({
      transactionId,
    });

    if (!transaction) {
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'transaction not found',
        details: {
          adminId,
          transactionId,
        },
        status: HttpStatus.NOT_FOUND,
      });
      throw new NotFoundException('transaction not found');
    }

    return transaction;
  };

  updateTransaction = async (
    input: Partial<TransactionEntity>,
    reference?: string,
    transactionId?: string,
  ) => {
    const updatedTransaction =
      await this.transactionRepository.updateTransaction(
        input,
        transactionId,
        reference,
      );

    if (updatedTransaction.ok === false) {
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'failed to update transaction',
        details: {
          input: JSON.stringify(input),
        },
        status: HttpStatus.NOT_MODIFIED,
      });
      throw new NotImplementedException('failed to implement transaction');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'transaction updated successfully',
      details: {
        input: JSON.stringify(input),
      },
    });

    return updatedTransaction;
  };

  createRevenueWallet = async (
    input: CreateRevenueWalletInterface,
    queryRunner: QueryRunner,
  ) => {
    const manager = queryRunner ? queryRunner.manager : this.dataSource.manager;
    const existingWallet = await this.revenueWalletRepo.fetchRevenueWallet({
      userId: input.userId,
    });

    if (existingWallet) {
      this.logger.error(`wallet exists for user ${input.userId}`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'create revenue wallet',
        details: {
          name: input.name,
          type: input.userType,
        },
        status: HttpStatus.CONFLICT,
      });
      return;
    }
    const newWallet = manager.create(RevenueWalletEntity, input);
    await manager.save(newWallet);

    this.logger.log('revenue wallet created successfully');
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'create revenue wallet',
      details: {
        name: input.name,
        type: input.userType,
      },
    });

    return `wallet ${newWallet.revenueWalletId} created succesfully`;
  };

  fetchRevenueWallet = async (
    walletFilter: RevenueWalletFilterInterface,
    driver?: DriverEntity,
    dealer?: DealerEntity,
  ) => {
    const { userId, revenueWalletId } = walletFilter;
    const userType = dealer ? WalletUserEnum.dealer : WalletUserEnum.driver;

    if (!userType) {
      this.logger.warn('user not found');
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'user not found in request',
        details: { errorType: String(HttpStatus.FORBIDDEN) },
        status: HttpStatus.FORBIDDEN,
      });
      throw new BadRequestException('user details not found');
    }

    const filter = {
      ...(userId && { userId }),
      ...(revenueWalletId && { revenueWalletId }),
    };

    const revenueWallet =
      await this.revenueWalletRepo.fetchRevenueWallet(filter);

    if (!revenueWallet) {
      this.logger.error(`wallet with id ${JSON.stringify(filter)}`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'failed fetch revenue wallet',
        details: {
          ...filter,
          id: dealer ? dealer.dealerId : driver.driverId,
        },
        status: HttpStatus.NOT_FOUND,
      });
    }

    this.logger.log('revenue wallet fetched successfully');
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'revenue wallet fetched successfully',
      details: { ...filter },
    });

    return {
      message: 'revenue wallet fetched successfully',
      userType,
      revenueWallet,
    };
  };

  fetchRevenueWallets = async (
    filter: RevenueWalletsFilterInterface,
    dealer?: DealerEntity,
    driver?: DriverEntity,
  ) => {
    let type: WalletUserEnum;

    if (dealer) type = WalletUserEnum.dealer;
    else if (driver) type = WalletUserEnum.driver;

    if (!type) {
      this.logger.warn('user not provided');
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'user not provided',
        details: { errorType: String(HttpStatus.FORBIDDEN) },
        status: HttpStatus.FORBIDDEN,
      });
    }
    const { search, userType, createdAt, skip, take } = filter;
    const walletFilter = {
      ...(search !== undefined && { search }),
      ...(userType !== undefined && { userType }),
      ...(createdAt !== undefined && { createdAt }),
      skip,
      take,
    };

    const wallets =
      await this.revenueWalletRepo.fetchRevenueWallets(walletFilter);

    this.logger.log('wallets fetched successfully');
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'wallets fetched successfully',
      details: {
        filter: JSON.stringify(walletFilter),
        id: dealer ? dealer.dealerId : driver.driverId,
      },
    });

    return {
      message: 'revenue wallets fetched successfully',
      wallets,
    };
  };

  updateRevenueWallet = async (
    updateRevenueWalletInterface: UpdateRevenueWalletInterface,
    userId: string,
  ) => {
    const { revenueWalletId, revenueId, amount } = updateRevenueWalletInterface;
    const wallet = await this.revenueWalletRepo.fetchRevenueWallet({
      revenueWalletId,
    });

    if (wallet.userId !== userId) {
      this.logger.error('user unauthorized');
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'unauthorized request to update revenue wallet',
        details: {
          userId,
          data: JSON.stringify(updateRevenueWalletInterface),
        },
        status: HttpStatus.UNAUTHORIZED,
      });
      throw new UnauthorizedException('unauthorized');
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new BadRequestException('Invalid amount provided');
    }

    if (amount < 0) {
      this.logger.warn('Negative amount detected in updateRevenueWallet');
    }

    const balance = wallet.balance ?? 0;
    const currentBalance = balance + amount;
    const previousMetadata = wallet.metadata ?? {
      numberOfCredits: 0,
      totalRevenue: 0,
    };

    const updatedMetadata = {
      lastTransactionDate: new Date().toISOString(),
      numberOfCredits: previousMetadata.numberOfCredits + 1,
      totalRevenue: amount,
    };

    const input: Partial<RevenueWalletEntity> = {
      balance: currentBalance,
      previousBalance: balance,
      metadata: updatedMetadata,
    };

    let updatedWallet;
    try {
      updatedWallet = await this.revenueWalletRepo.updateWallet(
        revenueWalletId,
        input,
      );
    } catch (error) {
      this.logger.error(`Failed to update revenue wallet: ${error.message}`);
      this.auditLogService.error({
        logCategory: LogCategory.PAYMENT,
        description: 'Error updating revenue wallet',
        details: { userId, revenueWalletId, error: error.message },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      throw new InternalServerErrorException('Failed to update revenue wallet');
    }

    this.logger.log('revenue wallet updated successfully');
    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'revenue wallet updated successfully',
      details: {
        revenueId,
        input: JSON.stringify(input),
      },
    });

    return {
      message: 'revenue wallet updated successfully',
      wallet: updatedWallet,
    };
  };
}
// private calculateCommissions(deliveryFee: number, productAmount: number) {
//   const commissionOnDelivery = deliveryFee * 0.3;
//   const commissionOnProduct = productAmount * 0.05;
//   return {
//     platformCommission: commissionOnDelivery + commissionOnProduct,
//     driverShare: deliveryFee - commissionOnDelivery,
//     dealerShare: productAmount - commissionOnProduct,
//   };
// }

// private incrementTransactions(metadata: any) {
//   return {
//     ...metadata,
//     numberOfTransactions: (Number(metadata?.numberOfTransactions) || 0) + 1,
//   };
// }

// async updatePayment(paymentDto: UpdatePaymentDto) {
//   const { reference, purchase, email, source } = paymentDto;
//   const deliveryFee = Number(purchase.deliveryFee);
//   const productAmount = Number(purchase.price);
//   const totalAmount = deliveryFee + productAmount;

//   const { platformCommission, driverShare, dealerShare } = this.calculateCommissions(deliveryFee, productAmount);

//   const [buyer, { dealerId }] = await Promise.all([
//     this.buyerService.findBuyer(email),
//     this.productService.findProductByPaymentService(purchase.productId),
//   ]);

//   const dealerSub = await this.subAccountRepository.findSubAccountUserId(dealerId);
//   if (!dealerSub?.subAccountCode) throw new NotFoundException('Dealer sub-account not found');

//   const driverId = purchase.metadata?.driverId;
//   const [driverWallet, dealerWallet] = await Promise.all([
//     this.walletRepository.findWalletUserId(driverId),
//     this.walletRepository.findWalletUserId(dealerId),
//   ]);
//   if (!driverWallet || !dealerWallet) throw new NotFoundException('Driver or Dealer wallet not found');

//   const driverUpdate: UpdateWalletData = {
//     balance: driverShare + driverWallet.balance,
//     previousBalance: driverWallet.balance,
//     metadata: this.incrementTransactions(driverWallet.metadata),
//     updatedAt: new Date(),
//   };

//   const dealerUpdate: UpdateWalletData = {
//     balance: dealerShare + dealerWallet.balance,
//     previousBalance: dealerWallet.balance,
//     metadata: this.incrementTransactions(dealerWallet.metadata),
//     updatedAt: new Date(),
//   };

//   // 🔐 Consider wrapping below in a DB transaction
//   await Promise.all([
//     this.walletRepository.updateWallet(driverWallet.walletAccount, driverUpdate),
//     this.walletRepository.updateWallet(dealerWallet.walletAccount, dealerUpdate),
//   ]);

//   // Cashback adjustment
//   let finalCommission = platformCommission;
//   if (buyer.metadata?.cashbackWallet === 'true') {
//     const cashback = platformCommission * 0.01;
//     finalCommission -= cashback;
//     await this.updatCashbackMethod(cashback.toString(), buyer.buyerId);
//   }

//   const [paymentRecord, revenueRecord] = await Promise.all([
//     this.paymentRepository.makePayment({
//       email,
//       purchaseId: purchase.purchaseId,
//       reference,
//       amount: totalAmount,
//       productAmount,
//       deliveryFee,
//       driverShare,
//       dealerSubAccount: dealerSub.subAccountCode,
//       dealersWalletAccount: dealerWallet.walletAccount,
//       driversWalletAccount: driverWallet.walletAccount,
//       platformCommission: finalCommission,
//       status: PaymentStatus.paid,
//       createdAt: new Date(),
//       metadata: {},
//     }),
//     this.revenueRepository.createRevenue({
//       amount: finalCommission.toString(),
//       reference,
//       source,
//       recordedAt: new Date(),
//     }),
//   ]);

//   await this.auditLogService.log({
//     logCategory: LogCategory.PAYMENT,
//     description: 'Payment updated and processed successfully',
//     email,
//     details: {
//       reference,
//       dealerId,
//       driverId,
//       amount: totalAmount.toString(),
//       revenueId: revenueRecord.revenueId,
//     },
//   });

//   return paymentRecord;
// }
