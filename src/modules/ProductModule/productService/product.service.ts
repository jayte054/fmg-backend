import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '../interface/IProductRepository.interface';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';
import {
  AddDriverCredential,
  CreateProductCredentials,
  DriverDetails,
  FindProductsFilter,
  ProductResponse,
  Reviewers,
  UpdateProductCredentials,
} from '../utils/products.type';
import {
  CreateProductDto,
  FindProductsFilterDto,
  UpdateProductDto,
} from '../utils/products.dto';
import { AuthEntity } from '../../authModule/authEntity/authEntity';
import { productResObj } from '../utils/products.type';
import {
  DealerResponse,
  UpdateCredentials,
} from '../../usersModule/utils/user.types';
// import { DealerService } from '../../usersModule/service/dealer.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { dealerUtils } from '../utils/utils';

@Injectable()
export class ProductService {
  private logger = new Logger('ProductService');
  private dealerUtils: ReturnType<typeof dealerUtils>;
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  createProduct = async (
    dealer: DealerEntity,
    createProductCredentials: CreateProductCredentials,
  ) => {
    const {
      pricePerKg,
      supportsDebutOrder,
      supportsCommissionOrder,
      supportsSwapOrder,
    } = createProductCredentials;

    try {
      const createProductDto: CreateProductDto = {
        productId: uuidv4(),
        providerName: dealer.name,
        phoneNumber: dealer.phoneNumber,
        scale: dealer.scale,
        pricePerKg,
        rating: dealer.rating,
        address: dealer.address,
        location: dealer.location,
        linkedDrivers: [] as DriverDetails[],
        reviews: [] as Reviewers[],
        purchases: 0,
        dealerId: dealer.dealerId,
        metadata: {
          supportsDebutOrder,
          supportsCommissionOrder,
          supportsSwapOrder,
        },
      };

      const product: ProductResponse =
        await this.productRepository.createProduct(createProductDto);

      if (product) {
        await this.auditLogService.log({
          logCategory: LogCategory.PRODUCT,
          description: 'create product',
          email: dealer.email,
          details: {
            user: product.providerName,
            scale: product.scale,
          },
        });
        this.logger.verbose('product created successfully');
        return this.mapProductResponse(product);
      }
    } catch (error) {
      this.logger.error('failed to create product');
      throw new InternalServerErrorException('failed to create product');
    }
  };

  findProductById = async (
    user: AuthEntity,
    dealer: DealerEntity,
    productId: string,
  ): Promise<ProductResponse> => {
    try {
      const product = await this.productRepository.findProductById(productId);

      if (!product) {
        this.logger.log(`product with id ${productId} not found`);
        throw new NotFoundException('product not found');
      }

      if (product.dealerId !== dealer.dealerId || dealer.userId !== user.id) {
        this.logger.log('unauthorized dealer');
        throw new UnauthorizedException('unauthorized dealer');
      } else {
        await this.auditLogService.log({
          logCategory: LogCategory.PRODUCT,
          description: 'find product',
          email: dealer.email,
          details: {
            user: product.providerName,
            scale: product.scale,
          },
        });
        this.logger.verbose(`product with id ${productId} found successfully`);
        return this.mapProductResponse(product);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Allow known errors to propagate
      }
      this.logger.verbose(`product with product id ${productId} not found`);
      throw new InternalServerErrorException('product not found');
    }
  };

  findProductByPaymentService = async (
    productId: string,
  ): Promise<ProductResponse> => {
    try {
      const product = await this.productRepository.findProduct(productId);

      if (!product) {
        this.logger.log(`product with id ${productId} not found`);
        throw new NotFoundException('product not found');
      }

      return this.mapProductResponse(product);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Allow known errors to propagate
      }
      this.logger.verbose(`product with product id ${productId} not found`);
      throw new InternalServerErrorException('product not found');
    }
  };

  findProductByPurchaseService = async (
    productId: string,
  ): Promise<ProductResponse> => {
    try {
      const product = await this.productRepository.findProduct(productId);

      if (!product) {
        this.logger.log(`product with id ${productId} not found`);
        throw new NotFoundException('product not found');
      }

      if (product.linkedDrivers.length > 1) {
        const firstDriver = product.linkedDrivers.shift(); // Remove the first driver
        product.linkedDrivers.push(firstDriver!); // Add it to the end

        await this.productRepository.saveProduct(product);
        this.logger.verbose(
          `Product with ID ${productId} found and linked drivers rotated`,
        );
      }

      return this.mapProductResponse(product);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Allow known errors to propagate
      }
      this.logger.verbose(`product with product id ${productId} not found`);
      throw new InternalServerErrorException('product not found');
    }
  };

  findProducts = async (
    filterDto: FindProductsFilterDto,
  ): Promise<{
    data: ProductResponse[];
    total: number;
    currentPage: number;
  }> => {
    const { search, scale, price, createdAt, skip, take } = filterDto;

    const productsFilter: FindProductsFilter = {
      ...(search !== undefined && { search }),
      ...(scale !== undefined && { scale }),
      ...(price !== undefined && { price }),
      ...(createdAt !== undefined && { createdAt }),
      skip,
      take,
    };
    try {
      const { products, total }: productResObj =
        await this.productRepository.findProducts(productsFilter);

      console.log(products);

      if (!products.length) {
        this.logger.warn('products not found');
        throw new NotFoundException('products not found');
      }
      this.logger.verbose('purchases fetched successfully');

      await this.auditLogService.log({
        logCategory: LogCategory.PRODUCT,
        description: 'find products',
        details: {
          count: total.toString(),
        },
      });

      return {
        data: products,
        total,
        currentPage: Math.floor(skip / take) + 1,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.log(error);
      this.logger.error('error fetching products');
      throw new InternalServerErrorException(
        'an error occurred, please try again',
      );
    }
  };

  updateProduct = async (
    user: AuthEntity,
    dealerId: string,
    productId: string,
    updateProductCredentials: UpdateProductCredentials,
  ): Promise<ProductResponse> => {
    const { providerName, phoneNumber, scale, pricePerKg, address, location } =
      updateProductCredentials;

    try {
      const product: ProductResponse =
        await this.productRepository.findProductById(productId);

      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      if (product.dealerId !== dealerId) {
        this.logger.warn(
          `Unauthorized access attempt to product ID ${productId}`,
        );
        throw new UnauthorizedException('Unauthorized user access');
      }

      const updateProductDto: UpdateProductDto = {
        ...product,
        providerName: providerName ?? product.providerName,
        phoneNumber: phoneNumber ?? product.phoneNumber,
        scale: scale ?? product.scale,
        pricePerKg: pricePerKg ?? product.pricePerKg,
        address: address ?? product.address,
        location: location ?? product.location,
      };

      const updatedProduct: ProductResponse =
        await this.productRepository.updateProduct(productId, updateProductDto);

      const shouldUpdateDealer =
        providerName || phoneNumber || address || location || scale;

      if (shouldUpdateDealer) {
        await this.updateDealerDetails(user, dealerId, updateProductDto);
      }

      if (!updatedProduct) {
        this.logger.error(`Failed to update product with ID ${productId}`);
        throw new InternalServerErrorException('Product update failed');
      }

      await this.auditLogService.log({
        logCategory: LogCategory.PRODUCT,
        description: 'update product',
        email: user.email,
        details: {
          product: productId,
        },
      });

      this.logger.verbose(`Product update successful for ID ${productId}`);
      return this.mapProductResponse(updatedProduct);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while updating product ID ${productId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'An error occurred while updating the product',
      );
    }
  };

  private async updateDealerDetails(
    user: AuthEntity,
    dealerId: string,
    updateProductDto: UpdateProductDto,
  ) {
    const updateDealerCredentials: UpdateCredentials = {
      name: updateProductDto.providerName,
      phoneNumber: updateProductDto.phoneNumber,
      email: user.email,
      address: updateProductDto.address,
      location: updateProductDto.location,
      scale: updateProductDto.scale,
    };

    const updatedDealer: DealerResponse =
      await this.dealerUtils.updateDealerInfo(
        user,
        dealerId,
        updateDealerCredentials,
      );

    if (!updatedDealer) {
      this.logger.error(`Dealer update failed for user: ${user.email}`);
      throw new InternalServerErrorException('Dealer update failed');
    }
  }

  deleteProduct = async (
    dealerId: string,
    productId: string,
  ): Promise<string> => {
    try {
      const product = await this.productRepository.findProductById(productId);

      if (product.dealerId !== dealerId) {
        this.logger.log('unauthorized access to delete product');
        throw new UnauthorizedException('unauthorized access');
      }

      await this.productRepository.deleteProduct(productId);
      this.logger.verbose(`product with id ${productId} successfully deleted`);

      await this.auditLogService.log({
        logCategory: LogCategory.PRODUCT,
        description: 'delete product',
        details: {
          dealerId,
          productId,
        },
      });

      return 'product successfully deleted';
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('failed to delete product with id ', productId);
      throw new InternalServerErrorException('failed to delete product');
    }
  };

  addDriver = async (
    dealerId: string,
    productId: string,
    addDriverCredential: AddDriverCredential,
  ): Promise<ProductResponse | string> => {
    const { driverId, driverName, driverEmail, driverPhoneNumber } =
      addDriverCredential;
    try {
      if (!driverId || !driverName || !driverEmail || !driverPhoneNumber) {
        this.logger.warn('incomplete driver details');
        throw new BadRequestException('All driver details are required');
      }

      const product = await this.productRepository.findProductById(productId);

      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      if (product.dealerId !== dealerId) {
        this.logger.warn(
          `Unauthorized access attempt to product ID ${productId}`,
        );
        throw new UnauthorizedException('Unauthorized user access');
      }

      const { linkedDrivers } = product;

      const driver: DriverDetails = {
        driverId,
        driverName,
        driverEmail,
        driverPhoneNumber,
      };

      const driverExists = product.linkedDrivers.some(
        (driver) => driver.driverId === driverId,
      );
      if (driverExists) {
        this.logger.warn(
          `Driver with ID ${driverId} is already linked to product ${productId}`,
        );
        throw new ConflictException('Driver is already linked to this product');
      }

      // const updateProductDto: UpdateProductDto = {
      //   ...product,
      //   linkedDrivers: [...linkedDrivers, driver],
      // };

      const updateProductDto: UpdateProductDto = {
        productId: product.productId,
        providerName: product.providerName,
        phoneNumber: product.phoneNumber,
        scale: product.scale,
        pricePerKg: product.pricePerKg,
        rating: product.rating,
        address: product.address,
        location: product.location,
        linkedDrivers: [...linkedDrivers, driver], // Add new driver
        reviews: product.reviews,
        purchases: product.purchases,
        dealerId: product.dealerId,
      };

      const addDriver: ProductResponse = await this.productRepository.addDriver(
        productId,
        updateProductDto,
      );

      await this.auditLogService.log({
        logCategory: LogCategory.PRODUCT,
        description: 'add driver',
        details: {
          dealerId,
          productId,
          driverId,
        },
      });

      return this.mapProductResponse(addDriver);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('failed to add driver to product with id ', productId);
      throw new InternalServerErrorException('failed to add driver');
    }
  };

  removeDriver = async (
    dealerId: string,
    productId: string,
    driverId: string,
  ): Promise<ProductResponse> => {
    try {
      const product: ProductResponse =
        await this.productRepository.findProductById(productId);

      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      if (product.dealerId !== dealerId) {
        this.logger.log(
          'unauthorized access to product by dealer with id ',
          dealerId,
        );
        throw new UnauthorizedException('Unauthorized access');
      }
      const { linkedDrivers } = product;
      const updatedLinkedDrivers: DriverDetails[] = linkedDrivers.filter(
        (driver) => driver.driverId !== driverId,
      );

      product.linkedDrivers = updatedLinkedDrivers;

      const updateProductDto: UpdateProductDto = {
        ...product,
        // linkedDrivers: updatedLinkedDrivers,
      };

      const removeDriver: ProductResponse =
        await this.productRepository.removeDriver(productId, updateProductDto);

      await this.auditLogService.log({
        logCategory: LogCategory.PRODUCT,
        description: 'remove driver',
        details: {
          dealerId,
          productId,
          driverId,
        },
      });

      return this.mapProductResponse(removeDriver);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error('failed to remove driver from product id', productId);
      throw new InternalServerErrorException('failed to remove driver');
    }
  };

  private mapProductResponse = (product: ProductResponse): ProductResponse => {
    return {
      productId: product.productId,
      providerName: product.providerName,
      phoneNumber: product.phoneNumber,
      scale: product.scale,
      pricePerKg: product.pricePerKg,
      rating: product.rating,
      address: product.address,
      location: product.location,
      linkedDrivers: product.linkedDrivers,
      reviews: product.reviews,
      purchases: product.purchases,
      dealerId: product.dealerId,
    };
  };
}
