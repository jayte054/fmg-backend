import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeormconfig/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authModule/authModule';
import { JwtCookieMiddleware } from './common/middleware/auth.cookie.middleware';
import { UserModule } from './modules/usersModule/user.module';
import { BuyerController } from './modules/usersModule/controller/buyer.controller';
import { DealerController } from './modules/usersModule/controller/dealer.controller';
import { CloudinaryModule } from './modules/cloudinaryModule/cloudinary.module';
import { DealerRepositoryMiddleware } from './common/middleware/dealer.repository.middleware';
import { ProductController } from './modules/ProductModule/productController/product.controller';
import { ProductModule } from './modules/ProductModule/product.module';

@Module({
  imports: [
    ProductModule,
    CloudinaryModule,
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtCookieMiddleware)
      .forRoutes(BuyerController, DealerController);

    consumer.apply(DealerRepositoryMiddleware).forRoutes(ProductController);
  }
}
