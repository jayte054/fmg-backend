import { AccessoryDealerEntity } from 'src/modules/usersModule/userEntity/accessoryDealer.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccessoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  accessoryId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: string;

  @Column()
  imageUrl: string;

  @Column()
  quantity: string;

  @Column()
  isActive: boolean;

  @ManyToOne(() => DealerEntity, (dealer) => dealer.accessory, { eager: false })
  dealer: DealerEntity;

  @ManyToOne(
    () => AccessoryDealerEntity,
    (accDealer) => accDealer.accDealerId,
    { eager: false },
  )
  accDealer: AccessoryDealerEntity;

  @Column()
  dealerId: string;

  @Column({ nullable: true })
  accDealerId?: string;

  @Column()
  rating: number;

  @Column({ type: 'jsonb' })
  review: Record<string, string>;

  @Column({ type: 'jsonb' })
  metadata: Record<string, string>;
}
