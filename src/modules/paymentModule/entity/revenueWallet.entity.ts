import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RevenueWalletMetadata, WalletUserEnum } from '../utils/interface';

@Entity()
export class RevenueWalletEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  revenueWalletId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal' })
  balance: number;

  @Column({ type: 'decimal' })
  previousBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column()
  userId: string;

  @Column()
  userType: WalletUserEnum;

  @Column({ type: 'jsonb', default: {} })
  metadata: RevenueWalletMetadata;
}
