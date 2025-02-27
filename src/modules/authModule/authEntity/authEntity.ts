import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../utils/auth.enum';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';

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

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
