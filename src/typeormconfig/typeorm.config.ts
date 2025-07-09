import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { ProductEntity } from '../modules/ProductModule/productEntity/product.entity';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { PurchaseEntity } from 'src/modules/purchaseModule/purchaseEntity/purchase.entity';
import { PushNotificationEntity } from 'src/modules/notificationModule/notificationEntity.ts/notification.entity';
import { UserPushNotificationEntity } from 'src/modules/notificationModule/notificationEntity.ts/userNotification.entity';
import { TokenEntity } from 'src/modules/tokenModule/tokenEntity/token.entity';
import { AuditLogEntity } from 'src/modules/auditLogModule/auditLogEntity/auditLog.entity';
import { SubAccountEntity } from 'src/modules/paymentModule/entity/subaccount.entity';
import { WalletEntity } from 'src/modules/paymentModule/entity/wallet.entity';
import { PaymentEntity } from 'src/modules/paymentModule/entity/payment.entity';

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
    UserPushNotificationEntity,
    TokenEntity,
    AuditLogEntity,
    PaymentEntity,
    SubAccountEntity,
    WalletEntity,
  ],
  synchronize: process.env.TypeORM_SYNC || dbConfig.synchronize,
  migrations: ['dist/migrations/*.js'],
};
