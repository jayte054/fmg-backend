import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { IBuyerRepository } from '../interface/user.interface';
import { BuyerCredentials, CreateBuyerResponse } from '../utils/user.types';
import { CreateBuyerDto } from '../utils/user.dto';
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
  ): Promise<CreateBuyerResponse | any> => {
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
        return new DuplicateException();
      }

      const buyer = await this.buyerRepository.createBuyer(createBuyerDto);
      console.log('buyer-details', buyer);
      this.logger.verbose('buyer profile created successfully');
      return {
        id: buyer.id,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        phoneNumber: buyer.phoneNumber,
        email: buyer.email,
        address: buyer.address,
        location: buyer.location,
        role: buyer.role,
        isAdmin: buyer.isAdmin,
      };
    } catch (error) {
      console.log(error);
      this.logger.error('failed to create new buyer');
      if (error instanceof DuplicateException) {
        throw error;
      }
      throw new InternalServerErrorException('failed to create buyer');
    }
  };
}
