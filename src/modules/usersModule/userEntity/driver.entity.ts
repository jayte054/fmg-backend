import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleType } from '../utils/user.types';

@Entity()
export class DriverEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  driverId: string;

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
  vehicle: VehicleType;

  @Column()
  vehicleNumber: string;

  @Column()
  role: string;

  @Column()
  driversLicense: string;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => AuthEntity, (user) => user.driverId, {
    eager: false,
  })
  user: AuthEntity;

  @Column()
  userId: string;
}
