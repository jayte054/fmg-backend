import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RetailScale } from '../utils/user.types';
import { AuthEntity } from '../../authModule/authEntity/authEntity';
import { ProductEntity } from '../../ProductModule/productEntity/product.entity';
import { AccessoryEntity } from 'src/modules/accessoryModule/accessoryEntity/accessoryEntity';

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

  @Column()
  license: number;

  @Column({ default: false })
  verified?: boolean;

  @ManyToOne(() => AuthEntity, (user) => user.dealerId, { eager: false })
  user: AuthEntity;

  @OneToMany(() => ProductEntity, (products) => products.dealer, {
    eager: true,
  })
  products: ProductEntity[];

  @OneToMany(() => AccessoryEntity, (accessory) => accessory.dealer, {
    eager: true,
  })
  accessory: AccessoryEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ type: 'jsonb' })
  metadata?: Record<string, unknown>;

  @Column('uuid')
  userId: string;
}
