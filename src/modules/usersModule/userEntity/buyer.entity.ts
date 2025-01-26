import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class BuyerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  buyerId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

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

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => AuthEntity, (user) => user.buyerId, {
    eager: false,
  })
  user: AuthEntity;

  @Column()
  userId: string;
}
