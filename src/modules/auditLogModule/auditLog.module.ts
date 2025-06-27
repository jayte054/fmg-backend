import { Module } from '@nestjs/common';
import { AuditLogEntity } from './auditLogEntity/auditLog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogRepository } from './auditLogRepository/auditLog.repository';
import { AuditLogService } from './auditLogService/auditLog.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [
    AuditLogService,
    {
      provide: 'IAuditLogRepository',
      useClass: AuditLogRepository,
    },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
