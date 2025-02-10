import { CreateProductDto } from '../utils/products.dto';
import { ProductResponse } from '../utils/products.type';

export interface IProductRepository {
  createProduct(createProductDto: CreateProductDto): Promise<ProductResponse>;
  findProductById(productId: string): Promise<ProductResponse>;
  findProducts(options: {
    skip: number;
    take: number;
  }): Promise<{ products: ProductResponse[]; total: number }>;
}
