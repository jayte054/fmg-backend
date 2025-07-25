import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AdminEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  adminId: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  location: string;

  @Column()
  address: string;

  @Column()
  role: string;

  @Column()
  isAdmin: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;

  @ManyToOne(() => AuthEntity, (user) => user.adminId, { eager: false })
  user: AuthEntity;

  @Column('uuid')
  userId: string;
}
