import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerEntity } from './userEntity/buyer.entity';
import { BuyerRepository } from './repository/buyer.repository';
import { BuyerService } from './service/buyer.service';
import { BuyerController } from './controller/buyer.controller';
import { AuthModule } from '../authModule/authModule';
import { DealerEntity } from './userEntity/dealerEntity';
import { DealerService } from './service/dealer.service';
import { DealerRepository } from './repository/dealer.repository';
import { DriverEntity } from './userEntity/driver.entity';
import { DealerController } from './controller/dealer.controller';
import { CloudinaryModule } from '../cloudinaryModule/cloudinary.module';
import { DriverService } from './service/driver.service';
import { DriverRepository } from './repository/driver.repository';
import { DriverController } from './controller/driver.controller';
import { DealerRepositoryMiddleware } from 'src/common/middleware/dealer.repository.middleware';
import { DealerEntityRepository } from './repository/dealer.entity.repository';

@Module({
  imports: [
    CloudinaryModule,
    AuthModule,
    TypeOrmModule.forFeature([BuyerEntity, DealerEntity, DriverEntity]),
  ],
  controllers: [BuyerController, DealerController, DriverController],
  providers: [
    BuyerService,
    DealerService,
    DriverService,
    {
      provide: 'IBuyerRepository',
      useClass: BuyerRepository,
    },
    {
      provide: 'IDealerRepository',
      useClass: DealerRepository,
    },
    {
      provide: 'IDriverRepository',
      useClass: DriverRepository,
    },
    DealerEntityRepository,
  ],
  exports: [DealerEntityRepository],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DealerRepositoryMiddleware).forRoutes(DealerController);
  }
}
