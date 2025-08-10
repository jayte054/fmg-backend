import { AccessoryEntity } from 'src/modules/accessoryModule/accessoryEntity/accessoryEntity';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
// import { ProductEntity } from 'src/modules/ProductModule/productEntity/product.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccessoryDealerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  accDealerId: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ type: 'jsonb' })
  location: { latitude: number; longitude: number };

  @Column()
  role: string;

  @Column()
  isAdmin: boolean;

  @Column()
  rating: number;

  @ManyToOne(() => AuthEntity, (user) => user.dealerId, { eager: false })
  user: AuthEntity;

  //   @OneToMany(() => ProductEntity, (products) => products.dealer, {
  //     eager: true,
  //   })
  //   products: ProductEntity[];

  @OneToMany(() => AccessoryEntity, (accessory) => accessory.dealer, {
    eager: true,
  })
  accessory: AccessoryEntity;

  @Column('uuid')
  userId: string;
}
