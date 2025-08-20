import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InitializePaymentDto, VerifyPaymentDto } from '../utils/payment.dto';
import { ConfigService } from '@nestjs/config';
import { ProductService } from '../../ProductModule/productService/product.service';
import { firstValueFrom } from 'rxjs';
import { IPaymentRepository } from '../interface/IPaymentRepository';
import { ISubAccountRepository } from '../interface/ISubAccountRepository';
import { IWalletRepository } from '../interface/IWalletRepository';
import { WalletEntity } from '../entity/wallet.entity';
import {
  ActivateSubAccountInterface,
  CashbackWalletFilter,
  CreateCashbackWalletResponse,
  PaginatedCashbackWalletResponse,
  PaymentStatus,
  SubAccountResponse,
  UpdateCashbackInputInterface,
  UpdateWalletData,
  WalletStatus,
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
// import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,

    @Inject('ISubAccountRepository')
    private readonly subAccountRepository: ISubAccountRepository,

    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,

    @Inject('ICashbackWalletRepository')
    private readonly cashbackRepository: ICashbackWalletRepository,

    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService,
    private readonly messagingService: MessagingService,
    private readonly buyerService: BuyerService,
  ) {}

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
    // const platformCommission = commissionOnDeliveryFee;
    const driversShare = deliveryFee - commissionOnDeliveryFee;
    // const dealerShare = productAmount;
    const dealerShare = productAmount - commissionOnProductFee;

    const amountInKobo = totalAmount * 100;
    const dealerShareInKobo = Math.floor(dealerShare * 100);
    const platformCommissionInKobo = Math.floor(platformCommission * 100);

    const { dealerId } = await this.productService.findProductByPurchaseService(
      purchase.productId,
    );
    // const dealer = await this.dealerService.findDealerByService(dealerId);
    const dealerSub =
      await this.subAccountRepository.findSubAccountUserId(dealerId);
    // const driverId = purchase.metadata?.driverId;
    // const driver = await this.driverService.findDriverByService(driverId);

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
        throw new InternalServerErrorException('failed to initialize payment');
      }

      return { authorizationUrl: authUrl };
    } catch (error) {
      throw new InternalServerErrorException('failed to initialize payment');
    }
  };

  async verifyPayment(reference: string): Promise<{ message: string }> {
    const paystack_secret = this.configService.get('paystack_test_secret_key');
    const paystack_url = this.configService.get<string>('paystack_url');

    const url = `${paystack_url}/transaction/verify/${reference}`;
    const headers = { Authorization: `Bearer ${paystack_secret}` };

    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    const paymentData = response.data?.data;
    if (!paymentData || paymentData.status !== 'success') {
      throw new BadRequestException('payment verification failed');
    }

    this.auditLogService.log({
      logCategory: LogCategory.PAYMENT,
      description: 'Payment verified and processed successfully',
      email: paymentData.email,
      details: {
        reference,
      },
    });

    return { message: 'payment verified successfully' };
  }

  updatePayment = async (paymentDto: VerifyPaymentDto) => {
    const { reference, purchase, email } = paymentDto;
    const deliveryFee = parseFloat(purchase.deliveryFee);
    const productAmount = parseFloat(purchase.price);
    const totalAmount = deliveryFee + productAmount;

    const commissionOnDeliveryFee = deliveryFee * 0.3;
    const commissionOnProductFee = productAmount * 0.05;
    const platformCommission = commissionOnDeliveryFee + commissionOnProductFee;
    const driverShare = deliveryFee - commissionOnDeliveryFee;
    const dealerShare = productAmount - commissionOnProductFee;

    const buyer = await this.buyerService.findBuyer(email);

    const { dealerId } = await this.productService.findProductByPaymentService(
      purchase.productId,
    );
    const dealerSub =
      await this.subAccountRepository.findSubAccountUserId(dealerId);

    const driverId = purchase.metadata?.driverId;

    const driverWallet = await this.walletRepository.findWalletUserId(driverId);
    const dealerWallet = await this.walletRepository.findWalletUserId(dealerId);
    if (!driverWallet || !dealerWallet) {
      throw new NotFoundException('Driver or Dealer wallet not found');
    }

    if (!dealerSub?.subAccountCode) {
      throw new NotFoundException('Dealer sub-account not found');
    }

    const driverMetadata = { ...driverWallet.metadata };
    const prev = driverMetadata.numberOfTransactions;
    driverMetadata.numberOfTransactions =
      typeof prev === 'number' ? prev + 1 : 1;

    const dealerMetadata = { ...dealerWallet.metadata };
    const previous = Number(dealerMetadata.numberOfTransactions);
    dealerMetadata.numberOfTransactions =
      typeof previous === 'number' ? previous + 1 : 1;

    const updateDriverWalletData: UpdateWalletData = {
      balance: driverShare + driverWallet.balance,
      previousBalance: driverWallet.balance,
      metadata: driverMetadata,
      updatedAt: new Date(),
    };

    const updateDealerWalletData: UpdateWalletData = {
      balance: dealerShare + dealerWallet.balance,
      previousBalance: dealerWallet.balance,
      metadata: dealerMetadata,
      updatedAt: new Date(),
    };

    await this.walletRepository.updateWallet(
      driverWallet.walletAccount,
      updateDriverWalletData,
    );
    await this.walletRepository.updateWallet(
      dealerWallet.walletAccount,
      updateDealerWalletData,
    );

    let paymentRecord: PaymentEntity;
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

    if (buyer.metadata['cashbackWallet'] === 'true') {
      const amount = platformCommission * 0.01;
      const commission = platformCommission - amount;
      this.updatCashbackMethod(amount.toString(), buyer.buyerId);
      paymentRecord = await this.paymentRepository.makePayment({
        ...commonFields,
        platformCommission: commission,
      });

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Payment updated and processed successfully',
        email: email,
        details: {
          reference,
          dealerId,
          driverId,
          amount: totalAmount.toString(),
        },
      });

      return paymentRecord;
    } else {
      paymentRecord = await this.paymentRepository.makePayment({
        ...commonFields,
        platformCommission,
      });

      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Payment updated and processed successfully',
        email: email,
        details: {
          reference,
          dealerId,
          driverId,
          amount: totalAmount.toString(),
        },
      });

      return paymentRecord;
    }
  };

  createWallet = async (
    walletInput: Partial<WalletEntity>,
    accountId: string,
    email: string,
  ): Promise<WalletEntity> => {
    const { walletName, userId } = walletInput;
    const accExtension = Math.floor(100000 + Math.random() * 900000).toString();
    const walletAccount = `${accountId}-${accExtension}`;

    const input: Partial<WalletEntity> = {
      walletName,
      walletAccount,
      userId,
      status: WalletStatus.active,
      balance: 0,
      previousBalance: 0,
      createdAt: new Date(),
      metadata: {},
    };

    const newWallet = await this.walletRepository.createWallet(input);

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

  withdrawFromWallet = async (
    amount: number,
    driver: DriverEntity,
  ): Promise<{ wallet?: WalletEntity; message?: string }> => {
    const request_number = this.configService.get<string>(
      'platform_whithdrawal_request_number',
    );
    const { driverId, email } = driver;
    const wallet = await this.walletRepository.findWalletUserId(driverId);
    if (wallet.balance < amount) {
      this.logger.error(`insufficient balance for driver ${driverId}`);
      return { message: 'insufficient balance' };
    }

    if (wallet.userId !== driverId) {
      this.logger.error('unauthorized withdrawal access');
      return { message: 'unauthorized' };
    }

    const bankDetails = wallet.metadata?.bankName as {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };

    if (!bankDetails?.accountNumber || !bankDetails.accountName) {
      throw new Error('Missing bank details in wallet metadata');
    }

    const newBalance = wallet.balance - amount;

    const metadata = wallet.metadata;
    const currentWithdrawals = metadata.numberOfWithdrawals;
    metadata.numberOfWithdrawals =
      typeof currentWithdrawals === 'number' ? currentWithdrawals + 1 : 1;
    const totalAmountWithdrawn = metadata.totalAmountWithdrawn;
    metadata.totalAmountWithdrawn =
      typeof totalAmountWithdrawn === 'number'
        ? totalAmountWithdrawn + amount
        : amount;

    const updateWalletData: UpdateWalletData = {
      ...wallet,
      balance: newBalance,
      previousBalance: wallet.balance,
      metadata,
      updatedAt: new Date(),
    };

    const updatedWallet = await this.walletRepository.updateWallet(
      wallet.walletAccount,
      updateWalletData,
    );

    if (updatedWallet) {
      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Driver wallet withdrawal successful',
        email,
        details: {
          amount: amount.toString(),
          newBalance: newBalance.toString(),
        },
      });

      await this.messagingService.sendWithdrawalRequest(
        request_number,
        `
          driver ${driver.firstName} ${driver.lastName} has requested a withdrawal into 
          Account Name: ${bankDetails.accountName}
          Account Number: ${bankDetails.accountNumber}
          Bank Name: ${bankDetails.bankName}
          Amount: ${amount}
          `,
        driverId,
        amount.toString(),
        wallet.walletId,
      );

      this.logger.log(
        `Withdrawal of ${amount} from driver ${driverId} successful`,
      );
      return {
        wallet: updatedWallet,
        message: 'withdrawal process successfully initiated',
      };
    } else {
      this.auditLogService.log({
        logCategory: LogCategory.PAYMENT,
        description: 'Driver wallet withdrawal unsuccessful',
        email,
        details: {
          amount: amount.toString(),
          newBalance: newBalance.toString(),
        },
      });

      this.logger.error('failed to implement withdrawal');
      return { message: 'failed to implement withdrawal' };
    }
  };

  createSubAccount = async (
    subAccountInput: Partial<SubAccountEntity>,
    name: string,
    email: string,
    dealerId: string,
  ): Promise<SubAccountResponse | { message: string }> => {
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
      const newSubAccount = await this.subAccountRepository.createSubAccount({
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
      },
    };

    const cashbackWallet =
      await this.cashbackRepository.createCashbackWallet(input);

    const saidBuyer = await this.buyerService.findBuyer(buyer.userId);
    saidBuyer.metadata = {
      cashbackWallet: 'true',
    };
    await this.buyerService.saveBuyer(saidBuyer);

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
      description: 'cashback wallets fetched by admin ${}',
      details: {
        total: wallets.total.toString(),
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

  private updatCashbackMethod = async (amount: string, buyerId: string) => {
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
}
