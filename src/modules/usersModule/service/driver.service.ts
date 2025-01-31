import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IDriverRepository } from '../interface/user.interface';
import { CreateDriverCredentials, DriverResponse } from '../utils/user.types';
import { CreateDriverDto } from '../utils/user.dto';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { CloudinaryService } from 'src/modules/cloudinaryModule/cloudinaryService/cloudinary.service';

@Injectable()
export class DriverService {
  private logger = new Logger('DriverRepository');
  constructor(
    @Inject('IDriverRepository')
    private readonly driverRepository: IDriverRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  createDriver = async (
    user: AuthEntity,
    driverCredentials: CreateDriverCredentials,
    files: Express.Multer.File[],
  ): Promise<DriverResponse> => {
    const { firstName, lastName, vehicleNumber, address, vehicle } =
      driverCredentials;
    try {
      if (!files || files.length < 2) {
        throw new InternalServerErrorException('both files should be provided');
      }

      const [driversLicenseFile, imageFile] = files;
      const driversLicense: any =
        await this.cloudinaryService.uploadImage(driversLicenseFile);

      const imageUrl: any = await this.cloudinaryService.uploadImage(imageFile);

      const createDriverDto: CreateDriverDto = {
        driverId: uuidv4(),
        firstName,
        lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        vehicle,
        vehicleNumber,
        address,
        driversLicense,
        imageUrl,
        role: user.role,
        isAdmin: user.isAdmin,
        userId: user.id,
      };

      const driver: DriverResponse =
        await this.driverRepository.createDriver(createDriverDto);
      return this.mapDriverResponse(driver);
    } catch (error) {
      this.logger.error('failed to create new driver');
      throw new InternalServerErrorException(
        'an error occurred when creating new driver',
      );
    }
  };

  private mapDriverResponse = (
    driverResponse: DriverResponse,
  ): DriverResponse => {
    return {
      driverId: driverResponse.driverId,
      firstName: driverResponse.firstName,
      lastName: driverResponse.lastName,
      phoneNumber: driverResponse.phoneNumber,
      email: driverResponse.email,
      address: driverResponse.address,
      vehicle: driverResponse.vehicle,
      role: driverResponse.role,
      driversLicense: driverResponse.driversLicense,
      imageUrl: driverResponse.imageUrl,
      isAdmin: driverResponse.isAdmin,
      userId: driverResponse.userId,
    };
  };
}
