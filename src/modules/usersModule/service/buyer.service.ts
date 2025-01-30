import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { IBuyerRepository } from '../interface/user.interface';
import { BuyerCredentials, buyerResObj, BuyerResponse } from '../utils/user.types';
import { CreateBuyerDto, UpdateBuyerDto } from '../utils/user.dto';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { DuplicateException } from 'src/common/exceptions/exceptions';

@Injectable()
export class BuyerService {
  private logger = new Logger('UserRepository');
  constructor(
    @Inject('IBuyerRepository')
    private readonly buyerRepository: IBuyerRepository,
  ) {}

  createBuyer = async (
    buyerCredentials: BuyerCredentials,
    user: AuthEntity,
  ): Promise<BuyerResponse> => {
    const { firstName, lastName, address, location } = buyerCredentials;
    const createBuyerDto: CreateBuyerDto = {
      buyerId: uuidV4(),
      email: user.email,
      firstName,
      lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isAdmin: user.isAdmin,
      address,
      location,
      userId: user.id,
    };
    try {
      const duplicateBuyer = await this.buyerRepository.findBuyerById(user.id);
      if (duplicateBuyer) {
        this.logger.debug('buyer profile has already been created');
        throw new DuplicateException(
          'A duplicate entry for the buyer was detected.',
          { context: 'BuyerService' },
        );
      }

      const buyer = await this.buyerRepository.createBuyer(createBuyerDto);

      this.logger.verbose('buyer profile created successfully');

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
      return this.mapToBuyerResponse(buyer);
    } catch (error) {
      this.logger.error('failed to fetch ');
      throw new InternalServerErrorException('failed to fetch user');
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
      return this.mapToBuyerResponse(updateBuyer);
    } catch (error) {
      console.log(error);
      this.logger.error('failed to update buyer details');
      throw new InternalServerErrorException('failed to update buyer details');
    }
  };

  deleteBuyer = async (buyerId: string, user: AuthEntity) => {
    try {
      const buyer = await this.buyerRepository.findBuyerById(user.id);
      if (buyerId !== buyer.buyerId) {
        this.logger.log('unauthourized user');
        throw new UnauthorizedException('user not authorized');
      }

      await this.buyerRepository.deleteBuyer(buyerId);
      this.logger.verbose(`buyer with id ${buyerId} deleted successfully`);
      return 'buyer profile successfully deleted';
    } catch (error) {
      this.logger.error(`failed to delete buyer with id ${buyerId}`);
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
    };
  };
}
