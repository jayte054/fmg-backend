import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { IDealerRepository } from '../interface/user.interface';
import { AuthEntity } from '../../authModule/authEntity/authEntity';
import {
  DealerResObj,
  DealerResponse,
  UpdateCredentials,
} from '../utils/user.types';
import {
  CreateDealerDto,
  DealerCredentialsDto,
  UpdateDealerDto,
} from '../utils/user.dto';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';
import { WalletEntity } from '../../paymentModule/entity/wallet.entity';
import { PaymentService } from '../../paymentModule/service/payment.service';
import { SubAccountEntity } from '../../paymentModule/entity/subaccount.entity';

@Injectable()
export class DealerService {
  private logger = new Logger('DealerService');
  constructor(
    @Inject('IDealerRepository')
    private readonly dealerRepository: IDealerRepository,
    private readonly auditLogService: AuditLogService,
    private readonly paymentService: PaymentService,
  ) {}

  createDealer = async (
    user: AuthEntity,
    dealerCredentials: DealerCredentialsDto,
  ): Promise<DealerResponse> => {
    const {
      name,
      address,
      location,
      scale,
      rating,
      bankName,
      bankCode,
      accountNumber,
    } = dealerCredentials;

    try {
      const createDealerDto: CreateDealerDto = {
        dealerId: uuidV4(),
        name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        address,
        location,
        scale,
        rating,
        role: user.role,
        isAdmin: user.isAdmin,
        userId: user.id,
      };

      const dealer = await this.dealerRepository.createDealer(createDealerDto);
      if (dealer) {
        this.logger.verbose('dealer profile created successfully');
      }

      const walletInput: Partial<WalletEntity> = {
        walletName: `${dealer.name}`,
        userId: dealer.dealerId,
      };
      const accountId = `${dealer.name.slice(0, 3)}`;
      const wallet = await this.paymentService.createWallet(
        walletInput,
        accountId,
        dealer.email,
      );

      const subAccountInput: Partial<SubAccountEntity> = {
        userId: dealer.userId,
        bankName,
        walletId: wallet.walletId,
        bankCode,
        accountNumber,
      };

      const subAccountResult = await this.paymentService.createSubAccount(
        subAccountInput,
        name,
        dealer.email,
        dealer.dealerId,
      );

      if ('sub_account' in subAccountResult) {
        const subAccountId = subAccountResult.sub_account.subAccountId;

        await this.auditLogService.log({
          logCategory: LogCategory.USER,
          description: 'dealer created',
          email: user.email,
          details: {
            message: 'dealer created successfully',
            walletid: wallet.walletId,
            subAccountId,
          },
        });
      }
      return this.mapToDealerResponse(dealer);
    } catch (error) {
      this.logger.error('failed to create dealer');
      throw new InternalServerErrorException(
        'error occurred while creating dealer',
      );
    }
  };

  findDealerById = async (
    user: AuthEntity,
    dealerId: string,
  ): Promise<DealerResponse> => {
    try {
      const dealer = await this.dealerRepository.findDealerId(dealerId);

      if (!dealer) {
        this.logger.log(`dealer with id ${user.id} not found`);
        throw new NotFoundException('user not found');
      }

      if (dealer.userId !== user.id) {
        this.logger.warn('Unauthorized user access');
        throw new UnauthorizedException('Unauthorized access');
      }

      this.logger.verbose(`user with id ${user.id} fetched successfully`);
      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'dealer fetched',
        email: user.email,
        details: {
          message: 'dealer fetched successfully',
        },
      });
      return this.mapToDealerResponse(dealer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(`error finding dealer with id ${user.id}`);
      throw new InternalServerErrorException('failed to find dealer');
    }
  };

  findDealers = async (
    user: AuthEntity,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: DealerResponse[];
    total: number;
    currentPage: number;
  }> => {
    const currentPage = Math.max(page, 1);
    const currentLimit = Math.max(limit, 1);
    const skip = (currentPage - 1) * currentLimit;

    try {
      const { dealers, total }: DealerResObj =
        await this.dealerRepository.findDealers({
          skip,
          take: limit,
        });

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'dealer deleted',
        email: user.email,
        details: {
          message: 'dealers fetched successfully',
        },
      });

      this.logger.verbose('dealers profile successfully fetched');
      return {
        data: dealers,
        total,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('failed to fetch dealers');
      throw new InternalServerErrorException('failed to fetch dealers');
    }
  };

  findDealerById2 = async (
    user: AuthEntity,
    dealerId: string,
  ): Promise<DealerResponse> => {
    try {
      const dealer = await this.dealerRepository.findDealerId(dealerId);

      if (!dealer) {
        this.logger.log(`dealer with id ${user.id} not found`);
        throw new NotFoundException('user not found');
      }

      this.logger.verbose(`user with id ${user.id} fetched successfully`);

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'dealer fetched 2',
        email: user.email,
        details: {
          message: 'dealer fetched successfully 2',
        },
      });
      return this.mapToDealerResponse(dealer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`error finding dealer with id ${user.id}`);
      throw new InternalServerErrorException('failed to find dealer');
    }
  };

  findDealerByService = async (dealerId: string): Promise<DealerResponse> => {
    try {
      const dealer = await this.dealerRepository.findDealerId(dealerId);

      return this.mapToDealerResponse(dealer);
    } catch (error) {
      this.logger.error(`error finding dealer with id `);
      throw new InternalServerErrorException('failed to find dealer');
    }
  };

  updateDealer = async (
    user: AuthEntity,
    dealerId: string,
    updateCredentials: UpdateCredentials,
  ): Promise<DealerResponse> => {
    try {
      const dealer = await this.dealerRepository.findDealerId(dealerId);

      if (!dealer) {
        throw new NotFoundException(`dealer with id ${user.id}not found`);
      }

      if (dealer.userId !== user.id) {
        this.logger.warn('Unauthorized user access');
        throw new UnauthorizedException('Unauthorized access');
      }

      dealer.name = updateCredentials.name || dealer.name;
      dealer.phoneNumber = updateCredentials.phoneNumber || dealer.phoneNumber;
      dealer.email = updateCredentials.email || dealer.email;
      dealer.address = updateCredentials.address || dealer.address;
      dealer.location = updateCredentials.location || dealer.location;
      dealer.scale = updateCredentials.scale || dealer.scale;

      const updateDto: UpdateDealerDto = {
        dealerId: dealer.dealerId,
        name: dealer.name,
        phoneNumber: dealer.phoneNumber,
        email: dealer.email,
        address: dealer.address,
        location: dealer.location,
        scale: dealer.scale,
        rating: dealer.rating,
        isAdmin: dealer.isAdmin,
        role: dealer.role,
        userId: dealer.userId,
      };

      const updatedDealer: DealerResponse =
        await this.dealerRepository.updateDealer(dealer.dealerId, updateDto);

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'dealer updated',
        email: user.email,
        details: {
          message: 'dealer updated successfully',
        },
      });
      return this.mapToDealerResponse(updatedDealer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(`failed to update dealer with id ${user.id}`);
      throw new InternalServerErrorException(
        "failed to update dealer's record",
      );
    }
  };

  deleteDealer = async (
    user: AuthEntity,
    dealerId: string,
  ): Promise<string> => {
    try {
      const dealer = await this.dealerRepository.findDealerId(dealerId);
      if (!dealer) {
        this.logger.log(`dealer with id ${user.id} not found`);
        throw new NotFoundException(`dealer with id ${user.id} not found`);
      }

      if (dealer.userId !== user.id) {
        this.logger.warn('Unauthorized user access');
        throw new UnauthorizedException('Unauthorized access');
      }

      const result = await this.dealerRepository.deleteDealer(dealer.dealerId);

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'dealer deleted',
        email: user.email,
        details: {
          message: 'dealer deleted successfully',
        },
      });
      if (result) return `dealer profile successfully deleted`;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error('failed to delete dealer profile');
      throw new InternalServerErrorException('failed to delete dealer profile');
    }
  };

  private mapToDealerResponse = (dealer: DealerResponse): DealerResponse => {
    return {
      dealerId: dealer.dealerId,
      name: dealer.name,
      phoneNumber: dealer.phoneNumber,
      email: dealer.email,
      address: dealer.address,
      location: dealer.location,
      role: dealer.role,
      isAdmin: dealer.isAdmin,
      scale: dealer.scale,
      rating: dealer.rating,
      userId: dealer.userId,
    };
  };
}
