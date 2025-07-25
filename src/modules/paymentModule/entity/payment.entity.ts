import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentStatus } from '../utils/interface';

@Entity()
export class PaymentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @Column()
  email: string;

  @Column()
  purchaseId: string;

  @Column()
  reference: string;

  @Column()
  amount: number;

  @Column()
  productAmount: number;

  @Column()
  deliveryFee: number;

  @Column()
  driverShare: number;

  @Column()
  platformCommission: number;

  @Column()
  dealerSubAccount: string;

  @Column()
  dealersWalletAccount: string;

  @Column()
  driversWalletAccount: string;

  @Column({ default: PaymentStatus.pending })
  status: PaymentStatus;

  @Column()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, string>;
}
