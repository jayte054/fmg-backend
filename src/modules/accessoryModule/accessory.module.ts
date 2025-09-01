import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessoryEntity } from './accessoryEntity/accessoryEntity';
import { AccessoryRepository } from './accessoryRepository.ts/accessory.repository';
import { AccessoryService } from './accessoryService/accessory.service';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { CloudinaryModule } from '../cloudinaryModule/cloudinary.module';
import { AccessoryController } from './accessoryController/accessory.controller';
import { BuyerRepositoryMiddleware } from 'src/common/middleware/buyer.repository.middleware';
import { DealerRepositoryMiddleware } from 'src/common/middleware/dealer.repository.middleware';
import { UserModule } from '../usersModule/user.module';

@Module({
  imports: [
    UserModule,
    AuditLogModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([AccessoryEntity]),
  ],
  providers: [
    AccessoryService,
    {
      provide: 'IAccessoryRepositoryInterface',
      useClass: AccessoryRepository,
    },
  ],
  controllers: [AccessoryController],
  exports: [AccessoryService],
})
export class AccessoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BuyerRepositoryMiddleware, DealerRepositoryMiddleware)
      .forRoutes(AccessoryController);
  }
}
