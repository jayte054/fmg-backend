import { Injectable } from '@nestjs/common';
import { AuditLogEntity } from '../auditLogEntity/auditLog.entity';
import { DataSource, Repository } from 'typeorm';
import {
  LogFilterInterface,
  PaginatedLogResponse,
} from '../utils/logInterface';
import { paginatedLog } from '../utils/utils';

@Injectable()
export class AuditLogRepository extends Repository<AuditLogEntity> {
  constructor(private dataSource: DataSource) {
    super(AuditLogEntity, dataSource.createEntityManager());
  }

  createLog = async (
    logDetails: Partial<AuditLogEntity>,
  ): Promise<AuditLogEntity> => {
    const newLog = this.create(logDetails);
    const log = await this.save(newLog);

    return log;
  };

  findLogs = async (
    logFilter: LogFilterInterface,
  ): Promise<PaginatedLogResponse> => {
    const { search, createdAt, logCategory, skip, take } = logFilter;
    const query = this.createQueryBuilder('log');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere('LOWER(log.email) ILIKE :lowerCaseSearch', {
        lowerCaseSearch,
      });
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('log.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (logCategory) {
      query.andWhere('log.logCategory = :logCategory', { logCategory });
    }

    const [logs, total] = await query.skip(skip).take(take).getManyAndCount();

    return paginatedLog({ logs, total, skip, take });
  };
}
