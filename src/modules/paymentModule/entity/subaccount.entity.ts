import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SubAccountEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  subAccountId: string;

  @Column()
  userId: string;

  @Column()
  subAccountCode: string;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column()
  walletId: string;

  @Column()
  bankCode: string;

  @Column()
  createdAt: Date;

  @Column({ type: 'jsonb' })
  metadata: Record<string, string>;
}
