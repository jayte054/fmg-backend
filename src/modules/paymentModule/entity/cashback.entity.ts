import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CashbackWalletEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  walletId: string;

  @Column()
  @Index()
  username: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  accountNumber: string;

  @Column({ default: false })
  isActive: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;
}
