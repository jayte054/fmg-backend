import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CylinderType, PriceType, PurchaseType } from '../utils/purchase.type';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';

@Entity()
export class PurchaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  purchaseId: string;

  @Column()
  productId: string;

  @Column('uuid', { array: true, nullable: true })
  accessoryIds: string[];

  @Column()
  price: string;

  @Column({ nullable: true })
  deliveryFee?: string;

  @Column({ type: 'enum', enum: PriceType })
  priceType: PriceType;

  @Column({ type: 'enum', enum: CylinderType, nullable: true })
  cylinder?: CylinderType;

  @Column({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;

  @Column()
  buyerName: string;

  @Column()
  address: string;

  @Column({ nullable: true, type: 'jsonb' })
  location?: { latitude: number; longitude: number };

  @Column()
  purchaseDate: string;

  @ManyToOne(() => BuyerEntity, (buyer) => buyer.purchases, { eager: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: BuyerEntity;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, string>;

  @Column()
  buyerId: string;
}
