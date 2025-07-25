import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './productEntity/product.entity';
import { UserModule } from '../usersModule/user.module';
import { ProductService } from './productService/product.service';
import { ProductController } from './productController/product.controller';
import { ProductRepository } from './productsRepository/product.repository';
import { DealerRepositoryMiddleware } from '../../common/middleware/dealer.repository.middleware';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { PaymentModule } from '../paymentModule/payment.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    AuditLogModule,
    forwardRef(() => PaymentModule),
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DealerRepositoryMiddleware).forRoutes(ProductController);
  }
}
