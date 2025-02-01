import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IDriverRepository } from '../interface/user.interface';
import {
  CreateDriverCredentials,
  driverResObj,
  DriverResponse,
  UpdateDriverCredentials,
} from '../utils/user.types';
import { CreateDriverDto, UpdateDriverDto } from '../utils/user.dto';
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
      this.logger.verbose(
        `driver profile with userId ${user.id} has been created`,
      );
      return this.mapDriverResponse(driver);
    } catch (error) {
      this.logger.error('failed to create new driver');
      throw new InternalServerErrorException(
        'an error occurred when creating new driver',
      );
    }
  };

  findDriverById = async (user: AuthEntity): Promise<DriverResponse> => {
    try {
      const driver: DriverResponse = await this.driverRepository.findDriverById(
        user.id,
      );
      if (!driver) {
        this.logger.verbose(`driver profile with id ${user.id} does not exist`);
        throw new NotFoundException('driver profile not found');
      }

      return this.mapDriverResponse(driver);
    } catch (error) {
      this.logger.error(`failed to find driver with id ${user.id}`);
      throw new InternalServerErrorException('failed to find driver');
    }
  };

  findDrivers = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: DriverResponse[];
    total: number;
    currentPage: number;
  }> => {
    const currentPage = Math.max(page, 1);
    const currentLimit = Math.max(limit, 1);
    const skip = (currentPage - 1) * currentLimit;

    try {
      const { drivers, total }: driverResObj =
        await this.driverRepository.findDrivers({
          skip,
          take: limit,
        });
      return {
        data: drivers,
        total,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('failed to fetch drivers');
      throw new InternalServerErrorException('failed to fetch drivers');
    }
  };

  updateDriver = async (
    user: AuthEntity,
    updateDriverCredentials: UpdateDriverCredentials,
    file: Express.Multer.File,
  ): Promise<DriverResponse> => {
    const {
      firstName,
      lastName,
      address,
      phoneNumber,
      email,
      vehicle,
      vehicleNumber,
    } = updateDriverCredentials;
    try {
      const driver = await this.driverRepository.findDriverById(user.id);

      if (!driver) {
        this.logger.log(`driver profile with id ${user.id} not found`);
        throw new NotFoundException('driver profile not found');
      }

      if (file) {
        const newDriversLicense: any =
          await this.cloudinaryService.uploadImage(file);

        if (driver.driversLicense) {
          const oldPublicId = this.extractPublicId(driver.driversLicense);
          await this.cloudinaryService.deleteImage(oldPublicId);
        }
        driver.driversLicense = newDriversLicense;
      }

      driver.firstName = firstName || driver.firstName;
      driver.lastName = lastName || driver.lastName;
      driver.phoneNumber = phoneNumber || driver.phoneNumber;
      driver.email = email || driver.email;
      driver.address = address || driver.address;
      driver.vehicle = vehicle || driver.vehicle;
      driver.vehicleNumber = vehicleNumber || driver.vehicleNumber;

      const updateDto: UpdateDriverDto = {
        driverId: driver.driverId,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phoneNumber: driver.phoneNumber,
        email: driver.email,
        address: driver.address,
        vehicle: driver.vehicle,
        vehicleNumber: driver.vehicleNumber,
        driversLicense: driver.driversLicense,
        imageUrl: driver.imageUrl,
      };

      const updateDriver: DriverResponse =
        await this.driverRepository.updateDriver(driver.driverId, updateDto);

      return this.mapDriverResponse(updateDriver);
    } catch (error) {
      this.logger.error('failed to update driver profile');
      throw new InternalServerErrorException('failde to update driver');
    }
  };

  updateDriverImage = async (
    user: AuthEntity,
    // updateDriverCredentials: UpdateDriverCredentials,
    file: Express.Multer.File,
  ): Promise<DriverResponse> => {
    try {
      const driver = await this.driverRepository.findDriverById(user.id);

      if (!driver) {
        this.logger.log(`driver profile with id ${user.id} not found`);
        throw new NotFoundException('driver profile not found');
      }

      if (file) {
        const newImageUrl: any = await this.cloudinaryService.uploadImage(file);

        if (driver.imageUrl) {
          const oldPublicId = this.extractPublicId(driver.imageUrl);
          await this.cloudinaryService.deleteImage(oldPublicId);
        }
        driver.imageUrl = newImageUrl;
      }

      const updateDto: UpdateDriverDto = {
        driverId: driver.driverId,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phoneNumber: driver.phoneNumber,
        email: driver.email,
        address: driver.address,
        vehicle: driver.vehicle,
        vehicleNumber: driver.vehicleNumber,
        driversLicense: driver.driversLicense,
        imageUrl: driver.imageUrl,
      };

      const updateDriver: DriverResponse =
        await this.driverRepository.updateDriver(driver.driverId, updateDto);

      return this.mapDriverResponse(updateDriver);
    } catch (error) {
      this.logger.error('failed to update driver profile');
      throw new InternalServerErrorException('failed to update driver');
    }
  };

  deleteDriverProfile = async (user: AuthEntity): Promise<any> => {
    try {
      const driver = await this.driverRepository.deleteDriverProfile(user.id);

      if (user.id !== driver.userId) {
        this.logger.log('user not authorized');
        throw new UnauthorizedException('user not unauthorized');
      }

      await this.driverRepository.deleteDriverProfile(driver.driverId);
      this.logger.verbose(
        `driver with ${user.id} profile deleted successfully`,
      );
      return 'driver profile successfully deleted';
    } catch (error) {
      this.logger.verbose('failed to delete profile');
      throw new InternalServerErrorException('failed to delete profile');
    }
  };

  private extractPublicId(imageUrl: string): string {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return publicId;
  }

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
      vehicleNumber: driverResponse.vehicleNumber,
      role: driverResponse.role,
      driversLicense: driverResponse.driversLicense,
      imageUrl: driverResponse.imageUrl,
      isAdmin: driverResponse.isAdmin,
      userId: driverResponse.userId,
    };
  };
}
