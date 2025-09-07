import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderTemplateEntity } from './orderTemplateEntity/orderTemplate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTemplateService } from './orderTemplateService/orderTemplate.service';
import { OrderTemplateRepository } from './templateRepository/orderTemplate.repository';
import { UserModule } from '../usersModule/user.module';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { OrderTemplateController } from './orderController/orderTemplate.controller';
import { BuyerRepositoryMiddleware } from 'src/common/middleware/buyer.repository.middleware';

@Module({
  imports: [
    AuditLogModule,
    UserModule,
    TypeOrmModule.forFeature([OrderTemplateEntity]),
  ],
  providers: [
    OrderTemplateService,
    {
      provide: 'IOrderInterfaceRepository',
      useClass: OrderTemplateRepository,
    },
  ],
  controllers: [OrderTemplateController],
  exports: [],
})
export class OrderTemplateModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BuyerRepositoryMiddleware)
      .forRoutes(OrderTemplateController);
  }
}
