import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WalletStatus } from '../utils/interface';

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
  previousBalance: number;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;
}
