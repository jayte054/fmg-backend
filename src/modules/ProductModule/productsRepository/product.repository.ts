import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../productEntity/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../utils/products.dto';

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
  constructor(private dataSource: DataSource) {
    super(ProductEntity, dataSource.createEntityManager());
  }

  createProduct = async (createProductDto: CreateProductDto) => {
    const newProduct = this.create(createProductDto);
    const product = await newProduct.save();
    return product;
  };

  findProductById = async (productId: string) => {
    const product = await this.findOne({
      where: { productId },
    });
    return product;
  };

  findProducts = async (options: { skip: number; take: number }) => {
    const productsQuery = this.createQueryBuilder('products');

    const [products, total] = await productsQuery
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return { products, total };
  };

  updateProduct = async (
    productId: string,
    updateProductDto: UpdateProductDto,
  ) => {
    await this.update({ productId }, updateProductDto);
    return await this.findOne({ where: { productId } });
  };

  deleteProduct = async (productId: string) => {
    return await this.delete({ productId });
  };

  addDriver = async (productId: string, updateProductDto: UpdateProductDto) => {
    await this.update({ productId }, updateProductDto);
    return await this.findOne({ where: { productId } });
  };

  removeDriver = async (
    productId: string,
    updateProductDto: UpdateProductDto,
  ) => {
    await this.update({ productId }, updateProductDto);
    return await this.findOne({ where: { productId } });
  };

  saveProduct = async (product: ProductEntity) => await this.save(product);
  findProduct = async (productId: string) =>
    await this.findOne({ where: { productId } });
}
