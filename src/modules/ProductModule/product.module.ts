import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './productEntity/product.entity';
import { UserModule } from '../usersModule/user.module';
import { ProductService } from './productService/product.service';
import { ProductController } from './productController/product.controller';
import { ProductRepository } from './productsRepository/product.repository';
import { DealerRepositoryMiddleware } from 'src/common/middleware/dealer.repository.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UserModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: [],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DealerRepositoryMiddleware).forRoutes(ProductController);
  }
}
