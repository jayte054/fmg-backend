import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { AuditLogFilterDto } from '../utils/dto';
import { LogFilterInterface } from 'src/modules/auditLogModule/utils/logInterface';

@Injectable()
export class AdminAuditLogService {
  private readonly logger = new Logger(AdminAuditLogService.name);
  constructor(private readonly auditLogService: AuditLogService) {}

  fetchAuditLogs = async (
    admin: AdminEntity,
    auditLogFilterDto: AuditLogFilterDto,
  ) => {
    const { search, logCategory, createdAt, skip, take } = auditLogFilterDto;

    const logFilter: LogFilterInterface = {
      ...(search !== undefined && { search }),
      ...(logCategory !== undefined && { logCategory }),
      ...(createdAt !== undefined && { createdAt }),
      skip,
      take,
    };

    const logs = await this.auditLogService.findLogs(logFilter);

    this.logger.log('logs fetched successfully');
    return logs;
  };

  fetchAuditLog = async (admin: AdminEntity, logId: string) => {
    const log = await this.auditLogService.findLog(logId);
    this.logger.log('logs fetched by admin', admin.adminId);
    return log;
  };
}
