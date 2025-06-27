import { AuditLogEntity } from '../auditLogEntity/auditLog.entity';
import {
  LogFilterInterface,
  PaginatedLogResponse,
} from '../utils/logInterface';

export interface IAuditLogRepository {
  createLog(logDetails: Partial<AuditLogEntity>): Promise<AuditLogEntity>;
  findLogs(logFilter: LogFilterInterface): Promise<PaginatedLogResponse>;
}
