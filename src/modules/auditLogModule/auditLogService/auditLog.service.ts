import { Inject, Injectable } from '@nestjs/common';
import { IAuditLogRepository } from '../interface/IAuditLogInterface';
import { AuditLogInterface, LogFilterInterface } from '../utils/logInterface';
import { AuditLogEntity } from '../auditLogEntity/auditLog.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  log = async (logInterface: AuditLogInterface): Promise<AuditLogEntity> => {
    const { logCategory, description, email, details } = logInterface;

    const newLog = await this.auditLogRepository.createLog({
      logCategory,
      description,
      email,
      details,
      createdAt: new Date(),
    });

    return newLog;
  };

  findLogs = async (logFilter: LogFilterInterface) => {
    const { search, createdAt, logCategory, skip, take } = logFilter;

    const filter = {
      ...(search !== undefined && { search }),
      ...(createdAt !== undefined && { createdAt }),
      ...(logCategory !== undefined && { logCategory }),
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    };

    const logs = await this.auditLogRepository.findLogs(filter);

    return logs;
  };
}
