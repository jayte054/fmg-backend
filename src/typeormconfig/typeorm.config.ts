import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { ProductEntity } from '../modules/ProductModule/productEntity/product.entity';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { PurchaseEntity } from 'src/modules/purchaseModule/purchaseEntity/purchase.entity';
import { PushNotificationEntity } from 'src/modules/notificationModule/notificationEntity.ts/notification.entity';

const dbConfig: any = config.get('db');
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [
    AuthEntity,
    BuyerEntity,
    DealerEntity,
    DriverEntity,
    ProductEntity,
    PurchaseEntity,
    PushNotificationEntity,
  ],
  synchronize: process.env.TypeORM_SYNC || dbConfig.synchronize,
  migrations: ['dist/migrations/*.js'],
};
