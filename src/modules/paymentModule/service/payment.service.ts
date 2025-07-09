import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InitializePaymentDto, VerifyPaymentDto } from '../utils/payment.dto';
import { PaymentEntity } from '../entity/payment.entity';
import { ConfigService } from '@nestjs/config';
import { ProductService } from 'src/modules/ProductModule/productService/product.service';
import { firstValueFrom } from 'rxjs';
import { IPaymentRepository } from '../interface/IPaymentRepository';
import { ISubAccountRepository } from '../interface/ISubAccountRepository';
import { IWalletRepository } from '../interface/IWalletRepository';
import { WalletEntity } from '../entity/wallet.entity';
import {
  PaymentStatus,
  UpdateWalletData,
  WalletStatus,
} from '../utils/interface';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';

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

    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService,
  ) {}

  initializePayment = async (paymentDto: InitializePaymentDto) => {
    const { email, purchase } = paymentDto;
    const paystack_secret = this.configService.get<string>(
      'paystack_test_secret_key',
    );
    const platform_code = this.configService.get<string>(
      'platform_sub_account_code',
    );
    const paystack_url = this.configService.get('paystack_url');
    // const url = `${paystack_url}/verify/${reference}`;
    // const headers = { Authorization: `Bearer ${paystack_secret}` };

    // const response = await axios.get(url, { headers });

    // const paymentData = response.data?.data;
    // if (!paymentData || paymentData.status !== 'success') {
    //   this.logger.error('bad request');
    //   throw new BadRequestException('Payment verification failed');
    // }

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

    const response = await firstValueFrom(
      this.httpService.post(
        `${paystack_url}/initialize`,
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
  };

  async verifyPayment(paymentDto: VerifyPaymentDto): Promise<PaymentEntity> {
    const { reference, purchase } = paymentDto;
    const paystack_secret = this.configService.get('paystack_test_secret_key');
    const paystack_url = this.configService.get<string>('paystack_url');

    const url = `${paystack_url}/verify/${reference}`;
    const headers = { Authorization: `Bearer ${paystack_secret}` };

    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    const paymentData = response.data?.data;
    if (!paymentData || paymentData.status !== 'success') {
      throw new BadRequestException('payment verification failed');
    }

    const deliveryFee = parseFloat(purchase.deliveryFee);
    const productAmount = parseFloat(purchase.price);
    const totalAmount = deliveryFee + productAmount;

    const commissionOnDeliveryFee = deliveryFee * 0.3;
    const commissionOnProductFee = productAmount * 0.05;
    const platformCommission = commissionOnDeliveryFee + commissionOnProductFee;
    const driverShare = deliveryFee - commissionOnDeliveryFee;
    const dealerShare = productAmount - commissionOnProductFee;

    const { dealerId } = await this.productService.findProductByPurchaseService(
      purchase.productId,
    );
    const dealerSub =
      await this.subAccountRepository.findSubAccountUserId(dealerId);

    const driverId = purchase.metadata?.driverId;

    const driverWallet = await this.walletRepository.findWalletUserId(driverId);
    const dealerWallet = await this.walletRepository.findWalletUserId(dealerId);

    const updateDriverWalletData: UpdateWalletData = {
      balance: driverShare + driverWallet.balance,
      previousBalance: driverWallet.balance,
      updatedAt: new Date(),
    };

    const updateDealerWalletData: UpdateWalletData = {
      balance: dealerShare + dealerWallet.balance,
      previousBalance: dealerWallet.balance,
      updatedAt: new Date(),
    };

    await this.walletRepository.updateWallet(driverId, updateDriverWalletData);
    await this.walletRepository.updateWallet(dealerId, updateDealerWalletData);
    const paymentRecord = this.paymentRepository.makePayment({
      email: paymentData.email,
      purchaseId: purchase.purchaseId,
      reference,
      amount: totalAmount,
      productAmount,
      deliveryFee,
      driverShare,
      platformCommission,
      dealerSubAccount: dealerSub.subAccountCode,
      dealersWalletAccount: dealerWallet.walletAccount,
      driversWalletAccount: driverWallet.walletAccount,
      status: PaymentStatus.paid,
      createdAt: new Date(),
      metadata: {},
    });

    return paymentRecord;
  }

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
}
