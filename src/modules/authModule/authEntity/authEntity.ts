import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../utils/auth.enum';
import { BuyerEntity } from '../../usersModule/userEntity/buyer.entity';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';
import { DriverEntity } from '../../usersModule/userEntity/driver.entity';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@Entity()
@Unique(['email'])
export class AuthEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column()
  isAdmin: boolean;

  @Column()
  role: UserRole;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @OneToMany(() => BuyerEntity, (buyerId) => buyerId.user, {
    eager: true,
    cascade: true,
  })
  buyerId: BuyerEntity[];

  @OneToMany(() => DealerEntity, (dealerId) => dealerId.user, {
    eager: true,
    cascade: true,
  })
  dealerId: DealerEntity[];

  @OneToMany(() => DriverEntity, (driverId) => driverId.user, {
    eager: true,
    cascade: true,
  })
  driverId: DriverEntity[];

  @OneToMany(() => AdminEntity, (adminId) => adminId.user, { eager: true })
  adminId: AdminEntity[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
