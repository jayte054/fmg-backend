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
import { DriverController } from './modules/usersModule/controller/driver.controller';
import { BuyerRepositoryMiddleware } from './common/middleware/buyer.repository.middleware';
import { PurchaseController } from './modules/purchaseModule/purchaseController/purchase.controller';
import { PurchaseModule } from './modules/purchaseModule/purchase.module';
import { DriverRepositoryMiddleware } from './common/middleware/driver.repository.middleware';
import { TokenModule } from './modules/tokenModule/token.module';
import { AuditLogModule } from './modules/auditLogModule/auditLog.module';
import { TokenController } from './modules/tokenModule/controller/token.controller';
import { PaymentModule } from './modules/paymentModule/payment.module';
import { MigrationModule } from './migrationUtils/migration.module';
import { PaymentController } from './modules/paymentModule/controller/payment.controller';
import { AdminController } from './modules/usersModule/controller/admin.controller';

@Module({
  imports: [
    MigrationModule,
    PaymentModule,
    AuditLogModule,
    TokenModule,
    PurchaseModule,
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
      .forRoutes(
        BuyerController,
        DealerController,
        DriverController,
        ProductController,
        PurchaseController,
        TokenController,
        PaymentController,
        AdminController,
      );

    consumer.apply(DealerRepositoryMiddleware).forRoutes(ProductController);

    consumer
      .apply(BuyerRepositoryMiddleware, DriverRepositoryMiddleware)
      .forRoutes(PurchaseController, TokenController, PaymentController);
  }
}
