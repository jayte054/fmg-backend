import {
  CylinderType,
  PriceType,
  PurchaseType,
} from 'src/modules/purchaseModule/utils/purchase.type';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OrderTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column()
  productId: string;

  @Column()
  title: string;

  @Column('uuid', { array: true })
  accessoryIds: string[];

  @Column({ type: 'enum', enum: PriceType })
  priceType: PriceType;

  @Column({ type: 'enum', enum: CylinderType })
  cylinder?: CylinderType;

  @Column({ type: 'enum', enum: PurchaseType })
  purchaseType: PurchaseType;

  @Column()
  buyerName: string;

  @Column()
  address: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true, type: 'jsonb' })
  location?: { latitude: number; longitude: number };

  @ManyToOne(() => BuyerEntity, (buyer) => buyer.templates, { eager: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: BuyerEntity;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column()
  buyerId: string;
}
