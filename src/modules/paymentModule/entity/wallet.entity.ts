import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WalletStatus, WalletUserEnum } from '../utils/interface';

@Entity()
export class WalletEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  walletId: string;

  @Column()
  walletName: string;

  @Column()
  walletAccount: string;

  @Column()
  userId: string;

  @Column({ default: WalletStatus.inactive })
  status: WalletStatus;

  @Column()
  balance: number;

  @Column()
  availableBalance: number;
  // for driver => available balance is balance - lienBalance
  // for buyer => available balance is balance - lienBalance

  @Column()
  previousBalance: number;

  @Column()
  lienBalance?: number;

  @Column()
  addedByAdmin?: string;

  @Column({ type: 'enum', enum: WalletUserEnum })
  type: WalletUserEnum;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;
}
