import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAccessoryRepositoryInterface } from '../interface/iAccessory.interface';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import {
  AccessoryFilterDto,
  CreateAccessoryDto,
  UpdateAccessoryDto,
} from '../utils/dto';
import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';
import { CloudinaryService } from 'src/modules/cloudinaryModule/cloudinaryService/cloudinary.service';
import {
  AccessoryFilter,
  CreateAccessoryInput,
  CreateAccessoryResponse,
  PaginatedAccessoriesResponse,
  SuccessAccessoryResponse,
  UpdateAccessoryInput,
} from '../utils/types';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';

@Injectable()
export class AccessoryService {
  private readonly logger = new Logger(AccessoryService.name);
  constructor(
    @Inject('IAccessoryRepository')
    private readonly accessoryRepository: IAccessoryRepositoryInterface,
    private readonly auditLogService: AuditLogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  createAccessory = async (
    dealer: DealerEntity,
    createAccessoryDto: CreateAccessoryDto,
    files: Express.Multer.File[],
  ): Promise<CreateAccessoryResponse> => {
    const { title, description, price, quantity } = createAccessoryDto;

    if (!files || files.length === 0) {
      throw new BadRequestException('files for accessory not found');
    }

    const images = await this.cloudinaryService.uploadImages(files);
    const secureUrls = images.map((image) => image.secure_url);
    const createAccessoryInput: CreateAccessoryInput = {
      title,
      description,
      price: parseFloat(price),
      quantity: Number(quantity),
      imageUrls: secureUrls,
      isActive: true,
      dealerId: dealer.dealerId,
      rating: 0,
      createdAt: new Date(),
      review: {},
      metadata: {},
    };

    const newAccessory =
      await this.accessoryRepository.createAccessory(createAccessoryInput);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: 'new accessory created',
      email: dealer.email,
      details: {
        title: createAccessoryDto.title,
        price: price,
        quantity: quantity,
        imageCount: secureUrls.length.toString(),
      },
    });

    return {
      success: true,
      message: 'accessory created successfully',
      accessory: newAccessory,
    };
  };

  findAccessoryById = async (
    accessoryId: string,
    buyer?: BuyerEntity,
    dealer?: DealerEntity,
  ): Promise<SuccessAccessoryResponse> => {
    const { dealerId, email } = dealer;
    const { buyerId, email: buyerEmail } = buyer;
    const user = dealerId ?? buyerId;

    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);

    if (!accessory) {
      this.logger.error(`accessory with id ${accessoryId} not found`);
      throw new NotFoundException('accessory not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: `accessory ${accessoryId} fetched`,
      email: dealer ? email : buyerEmail,
      details: {
        accessoryId,
        user,
      },
    });

    return this.mapToSuccessfulAccessoryResponse(accessory);
  };

  findAccessoriesByDealer = async (
    dealer: DealerEntity,
    accessoryFilter: AccessoryFilterDto,
  ): Promise<PaginatedAccessoriesResponse> => {
    const { dealerId, search, isActive, rating, skip, take } = accessoryFilter;
    accessoryFilter.dealerId = dealer.dealerId;
    if (dealer.dealerId === accessoryFilter.dealerId) {
      this.auditLogService.log({
        logCategory: LogCategory.Accessories,
        description: 'unauthorized access',
        email: dealer.email,
        details: {
          dealerId: dealer.dealerId,
          accessoryFilter: JSON.stringify(accessoryFilter),
        },
      });
      this.logger.error('unauthorized accessories request');
      throw new ConflictException('unauthorized accessories request');
    }

    accessoryFilter.skip = skip ?? 0;
    accessoryFilter.take = take ?? 20;

    const filter: AccessoryFilter = {
      ...(dealerId !== undefined && { dealerId: accessoryFilter.dealerId }),
      ...(search !== undefined && { search }),
      ...(isActive !== undefined && { isActive }),
      ...(rating !== undefined && { rating }),
      skip: accessoryFilter.skip,
      take: accessoryFilter.take,
    };

    const accessories = await this.accessoryRepository.findAccessories(filter);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: `accessories fetched by ${dealer.dealerId}`,
      email: dealer.email,
      details: {
        id: dealer.dealerId,
        accessoryFilter: JSON.stringify(accessoryFilter),
      },
    });

    this.logger.log('accessories successfully fetched');
    return accessories;
  };

  findAccessories = async (
    accessoryFilter: AccessoryFilter,
    buyer?: BuyerEntity,
  ): Promise<PaginatedAccessoriesResponse> => {
    const { dealerId, search, isActive, rating, skip, take } = accessoryFilter;
    // if (dealer.dealerId !== accessoryFilter.dealerId) {
    //   this.auditLogService.log({
    //     logCategory: LogCategory.Accessories,
    //     description: 'unauthorized access',
    //     email: dealer.email,
    //     details: {
    //       dealerId: dealer.dealerId,
    //       accessoryFilter: JSON.stringify(accessoryFilter),
    //     },
    //   });
    //   this.logger.error('unauthorized accessories request');
    //   throw new ConflictException('unauthorized accessories request');
    // }

    accessoryFilter.skip = skip ?? 0;
    accessoryFilter.take = take ?? 20;

    const filter: AccessoryFilter = {
      ...(dealerId !== undefined && { dealerId: accessoryFilter.dealerId }),
      ...(search !== undefined && { search }),
      ...(isActive !== undefined && { isActive }),
      ...(rating !== undefined && { rating }),
      skip: accessoryFilter.skip,
      take: accessoryFilter.take,
    };

    const accessories = await this.accessoryRepository.findAccessories(filter);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: `accessories fetched  successfully by ${buyer.buyerId}`,
      details: {
        count: accessories.accessories.length.toString(),
        accessoryFilter: JSON.stringify(accessoryFilter),
      },
    });

    this.logger.log('accessories successfully fetched');
    return accessories;
  };

  updateAccessory = async (
    dealer: DealerEntity,
    accessoryId: string,
    updateAccessoryInput: UpdateAccessoryDto,
  ): Promise<SuccessAccessoryResponse> => {
    const {
      // dealerId,
      title,
      description,
      price,
      quantity,
      rating,
      review,
      metadata,
    } = updateAccessoryInput;
    updateAccessoryInput.dealerId = dealer.dealerId;

    const updateInput: UpdateAccessoryInput = {
      ...(updateAccessoryInput.dealerId !== undefined && {
        dealerId: updateAccessoryInput.dealerId,
      }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(quantity !== undefined && { quantity }),
      ...(rating !== undefined && { rating }),
      ...(review !== undefined && { review }),
      ...(metadata !== undefined && { metadata }),
    };

    if (Object.keys(updateInput).length === 0) {
      this.logger.error('empty update input, bad request');
      throw new BadRequestException('empty update input');
    }

    const response = await this.accessoryRepository.updateAccessory(
      accessoryId,
      updateInput,
    );

    if (!response) {
      this.auditLogService.error({
        logCategory: LogCategory.Accessories,
        email: dealer.email,
        status: HttpStatus.NOT_FOUND,
        details: {
          dealerId: dealer.dealerId,
          accessoryId,
          updateAccessoryInput: JSON.stringify(updateAccessoryInput),
        },
      });
      this.logger.log(`accessory with id ${accessoryId} not found`);
      throw new NotFoundException('Accessory not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: 'accessory updated successfully',
      email: dealer.email,
      details: {
        accessoryId,
        dealer: dealer.dealerId,
        updateAccessoryInput: JSON.stringify(updateAccessoryInput),
      },
    });

    this.logger.log(`accessory ${accessoryId} updated successfully`);

    return this.mapToSuccessfulAccessoryResponse(response);
  };

  deleteAccessory = async (dealer: DealerEntity, accessoryId: string) => {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);

    if (!accessory || accessory.dealerId !== dealer.dealerId) {
      this.logger.error('failed to find accessory with id', accessoryId);
      throw new NotFoundException('accessory not found');
    }

    await this.accessoryRepository.deleteAccessory(accessoryId);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      email: dealer.email,
      description: 'accessory deleted successfully',
      details: {
        accessoryId,
        dealer: dealer.dealerId,
      },
    }),
      this.logger.log(`accessory with id ${accessoryId} deleted successfully`);
    return 'accessory deleted successfully';
  };

  toggleAccessoryStatus = async (
    dealer: DealerEntity,
    accessoryId: string,
  ): Promise<{
    ok: boolean;
    isActive: boolean;
  }> => {
    const response =
      await this.accessoryRepository.toggleAccessoryStatus(accessoryId);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      email: dealer.email,
      description: 'status of accessory toggled successfully',
      details: {
        dealerId: dealer.dealerId,
        accessoryId,
        status: JSON.stringify(response.isActive),
      },
    });

    this.logger.log('accessory status successfully toggled');

    return response;
  };

  private mapToSuccessfulAccessoryResponse(
    accessory: AccessoryEntity,
  ): SuccessAccessoryResponse {
    return {
      status: HttpStatus.OK,
      message: 'Operation successful',
      data: accessory,
    };
  }
}
