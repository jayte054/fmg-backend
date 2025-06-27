import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './tokenEntity/token.entity';
import { TokenService } from './tokenService/token.service';
import { TokenRepository } from './tokenRepository/token.repository';
import { AuditLogModule } from '../auditLogModule/auditLog.module';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity]), AuditLogModule],
  providers: [
    TokenService,
    {
      provide: 'ITokenRepository',
      useClass: TokenRepository,
    },
  ],
  exports: [TokenService],
})
export class TokenModule {}
