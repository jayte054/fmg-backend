import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { ISellerRepository } from '../interface/user.interface';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import {
  SellerCredentials,
  sellerResObj,
  SellerResponse,
} from '../utils/user.types';
import { CreateSellerDto } from '../utils/user.dto';

@Injectable()
export class SellerService {
  private logger = new Logger('SellerService');
  constructor(
    @Inject('ISellerRepository')
    private readonly sellerRepository: ISellerRepository,
  ) {}

  createSeller = async (
    user: AuthEntity,
    sellerCredentials: SellerCredentials,
  ): Promise<SellerResponse> => {
    const { name, phoneNumber, address, location, scale, rating } =
      sellerCredentials;

    try {
      const createSellerDto: CreateSellerDto = {
        sellerId: uuidV4(),
        name,
        phoneNumber,
        email: user.email,
        address,
        location,
        scale,
        rating,
        role: user.role,
        isAdmin: user.isAdmin,
        userId: user.id,
      };

      const seller = await this.sellerRepository.createSeller(createSellerDto);
      if (seller) {
        this.logger.verbose('seller profile created successfully');
      }
      return this.mapToSellerResponse(seller);
    } catch (error) {
      this.logger.error('failed to create seller');
      throw new InternalServerErrorException(
        'error occurred while creating seller',
      );
    }
  };

  findSellerById = async (user: AuthEntity): Promise<SellerResponse> => {
    try {
      const seller = await this.sellerRepository.findSellerId(user.id);

      if (!seller) {
        this.logger.log(`seller with id ${user.id} not found`);
        throw new NotFoundException('user not found');
      }

      this.logger.verbose(`user with id ${user.id} fetched successfully`);
      return this.mapToSellerResponse(seller);
    } catch (error) {
      this.logger.error(`error finding seller with id ${user.id}`);
      throw new InternalServerErrorException('failed to find seller');
    }
  };

  findSellers = async (
    user: AuthEntity,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: SellerResponse[];
    total: number;
    currentPage: number;
  }> => {
    const currentPage = Math.max(page, 1);
    const currentLimit = Math.max(limit, 1);
    const skip = (currentPage - 1) * currentLimit;

    try {
      const { sellers, total }: sellerResObj =
        await this.sellerRepository.findSellers({
          skip,
          take: limit,
        });

      return {
        data: sellers,
        total,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('failed to fetch sellers');
      throw new InternalServerErrorException('failed to fetch sellers');
    }
  };

  private mapToSellerResponse = (seller: SellerResponse): SellerResponse => {
    return {
      sellerId: seller.sellerId,
      name: seller.name,
      phoneNumber: seller.phoneNumber,
      email: seller.email,
      address: seller.address,
      location: seller.location,
      role: seller.role,
      isAdmin: seller.isAdmin,
      scale: seller.scale,
      rating: seller.rating,
      userId: seller.userId,
    };
  };
}
