import * as config from 'config';
import { AuthEntity } from '../modules/authModule/authEntity/authEntity';
import { ProductEntity } from '../modules/ProductModule/productEntity/product.entity';
import { BuyerEntity } from '../modules/usersModule/userEntity/buyer.entity';
import { DriverEntity } from '../modules/usersModule/userEntity/driver.entity';
import { DealerEntity } from '../modules/usersModule/userEntity/dealerEntity';
import { PurchaseEntity } from '../modules/purchaseModule/purchaseEntity/purchase.entity';
import { FmgNotificationEntity } from '../modules/notificationModule/notificationEntity.ts/fmgNotification.entity';
import { UserNotificationEntity } from '../modules/notificationModule/notificationEntity.ts/userNotification.entity';
import { TokenEntity } from '../modules/tokenModule/tokenEntity/token.entity';
import { AuditLogEntity } from '../modules/auditLogModule/auditLogEntity/auditLog.entity';
import { SubAccountEntity } from '../modules/paymentModule/entity/subaccount.entity';
import { WalletEntity } from '../modules/paymentModule/entity/wallet.entity';
import { PaymentEntity } from '../modules/paymentModule/entity/payment.entity';
import { WithdrawalRequestEntity } from '../modules/notificationModule/notificationEntity.ts/withdrawalRequest.entity';
import { DataSourceOptions } from 'typeorm';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { AccessoryEntity } from 'src/modules/accessoryModule/accessoryEntity/accessoryEntity';
import { AccessoryDealerEntity } from 'src/modules/usersModule/userEntity/accessoryDealer.entity';

const dbConfig: any = config.get('db');
export const typeOrmConfig: DataSourceOptions = {
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
    FmgNotificationEntity,
    UserNotificationEntity,
    TokenEntity,
    AuditLogEntity,
    WalletEntity,
    SubAccountEntity,
    PaymentEntity,
    WithdrawalRequestEntity,
    AdminEntity,
    AccessoryEntity,
    AccessoryDealerEntity,
  ],
  // synchronize: process.env.TypeORM_SYNC || dbConfig.synchronize,
  synchronize: false,
  migrations: ['dist/migrations/*.ts'],
};
