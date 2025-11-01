import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RevenueSource } from '../utils/interface';

@Entity()
export class RevenueEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  revenueId: string;

  @Column()
  amount: string;

  @Column()
  reference: string;

  @Column({ default: false })
  isReversed: boolean;

  @Column()
  source: RevenueSource;

  @CreateDateColumn()
  recordedAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
