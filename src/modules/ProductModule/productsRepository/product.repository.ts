import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../productEntity/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../utils/products.dto';
import { FindProductsFilter } from '../utils/products.type';

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

  findProducts = async (productsFilter: FindProductsFilter) => {
    const { search, scale, price, createdAt, skip, take } = productsFilter;
    const productsQuery = this.createQueryBuilder('products');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      productsQuery.andWhere(
        `
        LOWER(products.providerName) ILIKE :lowerCaseSearch
        OR LOWER(products.address) ILIKE :lowerCaseSearch
        `,
        { lowerCaseSearch },
      );
    }

    if (scale) {
      productsQuery.andWhere('products.scale = :scale', { scale });
    }

    if (price) {
      productsQuery.andWhere('products.pricePerKg = :price', {
        price,
      });
    }

    if (createdAt) {
      productsQuery.andWhere('products.createdAt = :createdAt', { createdAt });
    }

    productsQuery.orderBy('products.createdAt', 'DESC');

    const [products, total] = await productsQuery
      .skip(skip)
      .take(take)
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
