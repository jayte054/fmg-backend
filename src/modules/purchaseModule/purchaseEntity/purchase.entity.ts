import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CylinderType, PriceType, PurchaseType } from '../utils/purchase.type';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';

@Entity()
export class PurchaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  purchaseId: string;

  @Column()
  productId: string;

  @Column()
  price: string;

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

  @Column({ nullable: true })
  location: string;

  @Column()
  purchaseDate: string;

  @ManyToOne(() => BuyerEntity, (buyer) => buyer.purchases, { eager: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: BuyerEntity;

  @Column()
  buyerId: string;
}
