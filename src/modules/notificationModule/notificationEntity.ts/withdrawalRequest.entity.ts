import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WithdrawalStatus } from '../utils/interface';

@Entity()
export class WithdrawalRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  requestId: string;

  @Column()
  amount: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;

  @Column({ default: WithdrawalStatus.pending })
  withdrawalStatus: WithdrawalStatus;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;
}
