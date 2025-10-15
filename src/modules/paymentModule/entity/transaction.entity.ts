import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus, TransactionType } from '../utils/interface';

@Entity()
export class TransactionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column()
  userId: string; //buyerId | driverId | dealerId

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ nullable: true })
  relatedTransactionId?: string;

  @Column({ nullable: true })
  reversalReason?: string;

  @Column({ default: false })
  isReversed: boolean;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ nullable: true })
  reference?: string;

  @Column({ nullable: true })
  revenueId?: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;

  @Column({ type: 'jsonb' })
  location?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
}
