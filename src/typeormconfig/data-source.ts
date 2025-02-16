import { DataSource } from 'typeorm';
import * as config from 'config';
// import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { ProductEntity } from '../modules/ProductModule/productEntity/product.entity';
// import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
// import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
// import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';

const dbConfig: any = config.get('db');

export const AppDataSource = new DataSource({
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [
    // AuthEntity,
    // BuyerEntity,
    // DealerEntity,
    // DriverEntity,
    ProductEntity,
  ],
  synchronize: process.env.TypeORM_SYNC || dbConfig.synchronize,
  migrations: ['dist/migrations/*.js'],
});

AppDataSource.initialize()
  .then(() => console.log('Data Source has been initialized!'))
  .catch((err) =>
    console.error('Error during Data Source initialization', err),
  );
export default AppDataSource;
