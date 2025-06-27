import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TokenType } from '../utils/token.interface';

@Entity('token_entity') // Optional: specify table name for clarity
export class TokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  tokenId: string;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; // Prefer Date for timestamps

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date; // Moved out of UpdateDateColumn

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column()
  tokenType: TokenType;

  @Column({ default: false })
  verificationStatus: boolean;

  @Column({ nullable: true })
  purchaseId?: string;

  @Column({ nullable: true })
  userId: string;
}
