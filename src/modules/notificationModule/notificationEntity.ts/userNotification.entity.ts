import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserPushNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  notificationId: string;

  @Column()
  driverName: string;

  @Column()
  buyerId: string;

  @Column()
  purchaseId: string;

  @Column()
  productName: string;

  @Column()
  message: string;

  @Column()
  address: string;

  @Column({ type: 'jsonb' })
  location: { latitude: number; longitude: number };

  @Column()
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;
}
