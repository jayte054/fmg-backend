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
import { CreateAccessoryDto } from '../utils/dto';
import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';
import { CloudinaryService } from 'src/modules/cloudinaryModule/cloudinaryService/cloudinary.service';
import {
  AccessoryFilter,
  CreateAccessoryInput,
  CreateAccessoryResponse,
  PaginatedAccessoriesResponse,
  UpdateAccessoryInput,
  UpdateAccessoryResponse,
} from '../utils/types';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';

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
    dealer: DealerEntity,
    accessoryId: string,
  ): Promise<AccessoryEntity> => {
    const { dealerId, email } = dealer;

    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);

    if (!accessory) {
      this.logger.error(`dealer with id ${dealerId} not found`);
      throw new NotFoundException('dealer not found');
    }

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      description: `accessory ${accessoryId} fetched`,
      email,
      details: {
        accessoryId,
        dealerId,
      },
    });

    return accessory;
  };

  findAccessoriesByDealer = async (
    dealer: DealerEntity,
    accessoryFilter: AccessoryFilter,
  ): Promise<PaginatedAccessoriesResponse> => {
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

    accessoryFilter.skip = accessoryFilter.skip ?? 0;
    accessoryFilter.take = accessoryFilter.take ?? 20;

    const accessories =
      await this.accessoryRepository.findAccessories(accessoryFilter);

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

  updateAccessory = async (
    dealer: DealerEntity,
    accessoryId: string,
    updateAccessoryInput: UpdateAccessoryInput,
  ): Promise<UpdateAccessoryResponse> => {
    const {} = updateAccessoryInput;
    updateAccessoryInput.dealerId = dealer.dealerId;
    const response = await this.accessoryRepository.updateAccessory(
      accessoryId,
      updateAccessoryInput,
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

    return {
      status: 'successful',
      message: 'accessory updated successfully',
      data: response,
    };
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
    const toggleAccessory =
      await this.accessoryRepository.toggleAccessoryStatus(accessoryId);

    this.auditLogService.log({
      logCategory: LogCategory.Accessories,
      email: dealer.email,
      description: 'status of accessory toggled successfully',
      details: {
        dealerId: dealer.dealerId,
        accessoryId,
        status: JSON.stringify(toggleAccessory.isActive),
      },
    });

    this.logger.log('accessory status successfully toggled');

    return toggleAccessory;
  };
}
