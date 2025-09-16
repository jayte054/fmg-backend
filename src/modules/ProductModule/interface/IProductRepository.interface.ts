import { ProductEntity } from '../productEntity/product.entity';
import { CreateProductDto, UpdateProductDto } from '../utils/products.dto';
import { FindProductsFilter, ProductResponse } from '../utils/products.type';

export interface IProductRepository {
  createProduct(createProductDto: CreateProductDto): Promise<ProductResponse>;
  findProductById(productId: string): Promise<ProductResponse>;
  findProducts(
    productsFilter: FindProductsFilter,
  ): Promise<{ products: ProductResponse[]; total: number }>;
  updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse>;
  deleteProduct(productId: string): Promise<any>;
  addDriver(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse>;
  removeDriver(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse>;
  saveProduct(product: ProductEntity): Promise<ProductEntity>;
  findProduct(productId: string): Promise<ProductEntity>;
}
