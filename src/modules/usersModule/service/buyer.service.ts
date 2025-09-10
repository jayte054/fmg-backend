import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IBuyerRepository } from '../interface/user.interface';
import { buyerResObj, BuyerResponse } from '../utils/user.types';
import {
  BuyerCredentialsDto,
  CreateBuyerDto,
  UpdateBuyerDto,
} from '../utils/user.dto';
import { AuthEntity } from '../../authModule/authEntity/authEntity';
import { DuplicateException } from '../../../common/exceptions/exceptions';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';
import { BuyerEntity } from '../userEntity/buyer.entity';

@Injectable()
export class BuyerService {
  private logger = new Logger('UserRepository');
  constructor(
    @Inject('IBuyerRepository')
    private readonly buyerRepository: IBuyerRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  createBuyer = async (
    buyerCredentials: BuyerCredentialsDto,
    user: AuthEntity,
  ): Promise<BuyerResponse> => {
    const { firstName, lastName, address, location } = buyerCredentials;
    const createBuyerDto: CreateBuyerDto = {
      email: user.email,
      firstName,
      lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isAdmin: user.isAdmin,
      address,
      location,
      userId: user.id,
      metadata: {},
    };
    try {
      const duplicateBuyer = await this.buyerRepository.findBuyerById(user.id);
      console.log(duplicateBuyer);
      if (duplicateBuyer) {
        this.logger.debug('buyer profile has already been created');
        throw new DuplicateException(
          'A duplicate entry for the buyer was detected.',
          { context: 'BuyerService' },
        );
      }

      const buyer = await this.buyerRepository.createBuyer(createBuyerDto);

      this.logger.verbose('buyer profile created successfully');

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'buyer created',
        email: user.email,
        details: {
          message: 'buyer created successfully',
        },
      });
      return this.mapToBuyerResponse(buyer);
    } catch (error) {
      console.log(error);
      this.logger.error('failed to create new buyer');
      if (error instanceof DuplicateException) {
        throw error;
      }
      throw new InternalServerErrorException('failed to create buyer');
    }
  };

  findBuyerById = async (user: AuthEntity): Promise<BuyerResponse> => {
    try {
      const buyer = await this.buyerRepository.findBuyerById(user.id);

      if (!buyer) {
        this.logger.log(`buyer with id ${user.id} not found`);
        throw new NotFoundException('user not found');
      }

      this.logger.verbose(`user with id ${user.id} successfully fetched`);
      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'buyer fetched',
        email: user.email,
        details: {
          message: 'buyer fetched successfully',
        },
      });
      return this.mapToBuyerResponse(buyer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Allow known errors to propagate
      }
      this.logger.error('failed to fetch ');
      throw new InternalServerErrorException('failed to fetch user');
    }
  };

  findBuyer = async (
    buyerId?: string,
    email?: string,
  ): Promise<BuyerEntity> => {
    try {
      const buyer = await this.buyerRepository.findBuyer(buyerId, email);
      if (!buyer) {
        this.logger.error('failed to find buyer', buyerId);
        this.auditLogService.error({
          logCategory: LogCategory.USER,
          description: 'wallet not found',
          status: HttpStatus.NOT_FOUND,
          details: {
            buyerId,
          },
        });
      }
      return buyer;
    } catch (error) {
      this.logger.error('failed to find buyer with id', buyerId);
      throw new InternalServerErrorException('faild to find buyer');
    }
  };

  findBuyers = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BuyerResponse[]; total: number; currentPage: number }> => {
    const currentPage = Math.max(page, 1);
    const currentLimit = Math.max(limit, 1);
    const skip = (currentPage - 1) * currentLimit;

    try {
      const { buyers, total }: buyerResObj =
        await this.buyerRepository.findBuyers({
          skip,
          take: limit,
        });

      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'buyers fetched',
        details: {
          count: total.toString(),
        },
      });

      return {
        data: buyers,
        total,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('failed to fetch buyers');
      throw new InternalServerErrorException('failed to fetch buyers');
    }
  };

  updateBuyer = async (
    user: AuthEntity,
    updateData: UpdateBuyerDto,
  ): Promise<BuyerResponse> => {
    try {
      const buyer: BuyerResponse = await this.buyerRepository.findBuyerById(
        user.id,
      );

      if (!buyer) {
        throw new NotFoundException(`Buyer with ID ${user.buyerId} not found`);
      }

      buyer.firstName = updateData.firstName || buyer.firstName;
      buyer.lastName = updateData.lastName || buyer.lastName;
      buyer.phoneNumber = updateData.phoneNumber || buyer.phoneNumber;
      buyer.email = updateData.email || buyer.email;
      buyer.address = updateData.address || buyer.address;
      buyer.location = updateData.location || buyer.location;
      buyer.metadata = updateData.metadata || buyer.metadata;

      const updateDto: UpdateBuyerDto = {
        buyerId: buyer.buyerId,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        phoneNumber: buyer.phoneNumber,
        email: buyer.email,
        address: buyer.address,
        location: buyer.location,
        role: buyer.role,
        isAdmin: buyer.isAdmin,
      };

      const updateBuyer = await this.buyerRepository.updateBuyer(
        updateDto.buyerId,
        updateDto,
      );
      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'buyer updated',
        email: user.email,
        details: {
          message: 'buyer updated successfully',
        },
      });
      return this.mapToBuyerResponse(updateBuyer);
    } catch (error) {
      this.logger.error('failed to update buyer details');
      throw new InternalServerErrorException('failed to update buyer details');
    }
  };

  saveBuyer = async (buyer: BuyerEntity): Promise<BuyerResponse> => {
    try {
      const _buyer = await this.buyerRepository.saveBuyer(buyer);

      this.logger.log('buyer entity successfully saved');
      this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'saved buyer entity',
        email: buyer.email,
        details: {
          buyer: buyer.buyerId,
        },
      });
      return this.mapToBuyerResponse(_buyer);
    } catch (error) {
      this.logger.error('failed to save buyer');
      throw new InternalServerErrorException('failed to save buyer');
    }
  };

  deleteBuyer = async (user: AuthEntity) => {
    try {
      const buyer = await this.buyerRepository.findBuyerById(user.id);
      if (user.id !== buyer.userId) {
        this.logger.log('unauthorized user');
        throw new UnauthorizedException('user not authorized');
      }

      await this.buyerRepository.deleteBuyer(buyer.buyerId);
      this.logger.verbose(
        `buyer with id ${user.id} profile deleted successfully`,
      );
      await this.auditLogService.log({
        logCategory: LogCategory.USER,
        description: 'buyer deleted',
        email: user.email,
        details: {
          message: 'buyer deleted successfully',
        },
      });
      return 'buyer profile successfully deleted';
    } catch (error) {
      this.logger.error(`failed to delete buyer profile`);
      throw new InternalServerErrorException(`failed to delete buyer`);
    }
  };

  private mapToBuyerResponse = (buyer: BuyerResponse): BuyerResponse => {
    return {
      buyerId: buyer.buyerId,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      phoneNumber: buyer.phoneNumber,
      email: buyer.email,
      address: buyer.address,
      location: buyer.location,
      role: buyer.role,
      isAdmin: buyer.isAdmin,
      userId: buyer.userId,
      metadata: buyer.metadata,
    };
  };
}
