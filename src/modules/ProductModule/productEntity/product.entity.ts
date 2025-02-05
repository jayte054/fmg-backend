import { RetailScale } from '../../usersModule/utils/user.types';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriversArray, Reviewers } from '../utils/products.type';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';

@Entity()
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @Column()
  providerName: string;

  @Column()
  phoneNumber: string;

  @Column()
  scale: RetailScale;

  @Column()
  pricePerKg: number;

  @Column()
  rating: number;

  @Column()
  address: string;

  @Column()
  location: string;

  @Column('jsonb', { array: true, nullable: true })
  linkedDriversId: DriversArray[];

  @Column('jsonb', { array: true, nullable: true })
  reviews: Reviewers[];

  @Column()
  purchases: number;

  @ManyToOne(() => DealerEntity, (dealer) => dealer.productId, { eager: false })
  dealer: DealerEntity;

  @Column()
  dealerId: string;
}
