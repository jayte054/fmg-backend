import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RetailScale } from '../utils/user.types';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';

@Entity()
export class SellerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  sellerId: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  location: string;

  @Column()
  role: string;

  @Column()
  isAdmin: boolean;

  @Column()
  scale: RetailScale;

  @Column()
  rating: number;

  @ManyToOne(() => AuthEntity, (user) => user.sellerId, { eager: false })
  user: AuthEntity;

  @Column()
  userId: string;
}
