import { RetailScale } from '../../usersModule/utils/user.types';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriverDetails, Reviewers } from '../utils/products.type';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';

@Entity()
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @Column()
  providerName: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: RetailScale })
  scale: RetailScale;

  @Column()
  pricePerKg: number;

  @Column()
  rating: number;

  @Column()
  address: string;

  @Column({ type: 'jsonb', default: [] })
  location: { latitude: number; longitude: number };

  @Column({ type: 'jsonb', default: [] })
  linkedDrivers: DriverDetails[];

  @Column({ type: 'jsonb', default: [] })
  reviews: Reviewers[];

  @Column()
  purchases: number;

  @ManyToOne(() => DealerEntity, (dealer) => dealer.products, { eager: false })
  @JoinColumn({ name: 'dealerId' })
  dealer: DealerEntity;

  @Column()
  dealerId: string;

  @Column({ type: 'jsonb', default: [] })
  metadata?: Record<string, string | boolean>;
}
