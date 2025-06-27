import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LogCategory } from '../utils/logInterface';

@Entity()
export class AuditLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  logId: string;

  @Column()
  logCategory: LogCategory;

  @Column()
  description: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'jsonb' })
  details: Record<string, string>;

  @Column()
  createdAt: Date;
}
