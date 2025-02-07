import { CreateProductDto } from '../utils/products.dto';
import { ProductResponse } from '../utils/products.type';

export interface IProductRepository {
  createProduct(createProductDto: CreateProductDto): Promise<ProductResponse>;
  findProductById(productId: string): Promise<ProductResponse>;
}
