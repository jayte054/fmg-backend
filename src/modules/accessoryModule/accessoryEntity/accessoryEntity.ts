import { AccessoryDealerEntity } from 'src/modules/usersModule/userEntity/accessoryDealer.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AccessoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  accessoryId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { array: true })
  imageUrls: string[];

  @Column()
  quantity: number;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  review: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;
}
