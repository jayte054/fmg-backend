import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../productEntity/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from '../utils/products.dto';

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
}
