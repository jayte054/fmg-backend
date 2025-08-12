import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IAuditLogRepository } from '../interface/IAuditLogInterface';
import {
  AuditLogInterface,
  ErrorAuditLogInterface,
  LogFilterInterface,
} from '../utils/logInterface';
import { AuditLogEntity } from '../auditLogEntity/auditLog.entity';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  log = async (logInterface: AuditLogInterface): Promise<AuditLogEntity> => {
    const { logCategory, description, email, details } = logInterface;
    try {
      const newLog = await this.auditLogRepository.createLog({
        logCategory,
        description,
        email,
        details,
        createdAt: new Date(),
      });

      return newLog;
    } catch (error) {
      this.logger.error('failed to log activity', { email, logCategory });
      throw new InternalServerErrorException('failed to log activity', error);
    }
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

  error = async (
    logInterface: ErrorAuditLogInterface,
  ): Promise<AuditLogEntity> => {
    const { logCategory, email, details, status } = logInterface;
    try {
      return await this.auditLogRepository.createLog({
        logCategory,
        description: JSON.stringify(status),
        email,
        details,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error('failed to log activity', { logCategory, email });
      throw new InternalServerErrorException('failed to log activity');
    }
  };
}
