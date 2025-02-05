import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '../interface/IProductRepository.interface';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import {
  CreateProductCredentials,
  ProductResponse,
} from '../utils/products.type';
import { CreateProductDto } from '../utils/products.dto';

@Injectable()
export class ProductService {
  private logger = new Logger('ProductService');
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  createProduct = async (
    dealer: DealerEntity,
    createProductCredentials: CreateProductCredentials,
  ) => {
    const { pricePerKg } = createProductCredentials;

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
        linkedDriversId: [],
        reviews: [],
        purchases: 0,
        dealerId: dealer.dealerId,
      };

      const product: ProductResponse =
        await this.productRepository.createProduct(createProductDto);

      if (product) {
        this.logger.verbose('product created successfully');
        return this.mapProductResponse(product);
      }
    } catch (error) {
      this.logger.error('failed to create product');
      throw new InternalServerErrorException('failed to create product');
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
      linkedDriversId: product.linkedDriversId,
      reviews: product.reviews,
      purchases: product.purchases,
      dealerId: product.dealerId,
    };
  };
}
