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

  @Column()
  location: string;

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

  @OneToMany(() => ProductEntity, (productId) => productId.dealer)
  productId: string;

  @Column()
  userId: string;
}
