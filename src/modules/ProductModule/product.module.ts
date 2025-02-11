import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './productEntity/product.entity';
import { UserModule } from '../usersModule/user.module';
import { ProductService } from './productService/product.service';
import { ProductController } from './productController/product.controller';
import { ProductRepository } from './productsRepository/product.repository';
import { DealerRepositoryMiddleware } from 'src/common/middleware/dealer.repository.middleware';
import { DealerService } from '../usersModule/service/dealer.service';
import { DealerRepository } from '../usersModule/repository/dealer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UserModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    DealerService,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'IDealerRepository',
      useClass: DealerRepository,
    },
  ],
  exports: [],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DealerRepositoryMiddleware).forRoutes(ProductController);
  }
}
