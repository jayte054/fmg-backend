import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RetailScale } from '../utils/user.types';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { ProductEntity } from 'src/modules/ProductModule/productEntity/product.entity';

@Entity()
export class DealerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  dealerId: string;

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
  scale: RetailScale;

  @Column()
  rating: number;

  @ManyToOne(() => AuthEntity, (user) => user.dealerId, { eager: false })
  user: AuthEntity;

  @OneToMany(() => ProductEntity, (products) => products.dealer, {
    eager: true,
  })
  products: ProductEntity[];

  @Column('uuid')
  userId: string;
}
