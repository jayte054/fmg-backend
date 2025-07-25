import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FmgNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  notificationId: string;

  @Column()
  purchaseId: string;

  @Column()
  productId: string;

  @Column()
  message: string;

  @Column()
  address: string;

  @Column({ type: 'jsonb' })
  location?: { latitude: number; longitude: number };

  @Column()
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;
}
