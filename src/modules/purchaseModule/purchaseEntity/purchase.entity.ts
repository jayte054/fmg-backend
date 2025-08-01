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

  @Column()
  price: string;

  @Column()
  deliveryFee?: string;

  @Column({ type: 'enum', enum: PriceType })
  priceType: PriceType;

  @Column({ type: 'enum', enum: CylinderType })
  cylinder: CylinderType;

  @Column({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;

  @Column()
  buyerName: string;

  @Column()
  address: string;

  @Column({ nullable: true, type: 'jsonb' })
  location: { latitude: number; longitude: number };

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
