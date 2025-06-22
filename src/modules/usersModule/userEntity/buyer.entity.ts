import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { PurchaseEntity } from 'src/modules/purchaseModule/purchaseEntity/purchase.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class BuyerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  buyerId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

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

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => AuthEntity, (user) => user.buyerId, {
    eager: false,
  })
  user: AuthEntity;

  @OneToMany(() => PurchaseEntity, (purchases) => purchases.buyer, {
    eager: true,
  })
  purchases: PurchaseEntity[];

  @Column('uuid')
  userId: string;
}
