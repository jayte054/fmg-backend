import { AuditLogEntity } from '../auditLogEntity/auditLog.entity';

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  PRODUCT = 'product',
  PURCHASE = 'purchase',
  TOKEN = 'token',
  NOTIFICATION = 'notification',
  USER = 'user',
}

export interface LogFilterInterface {
  search?: string;
  createdAt?: string;
  logCategory?: string;
  skip: number;
  take: number;
}

export interface LogInterface {
  logs: AuditLogEntity[];
  total: number;
  skip: number;
  take: number;
}

export interface PaginatedLogResponse {
  data: AuditLogEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface AuditLogInterface {
  logCategory: LogCategory;
  description: string;
  email?: string;
  details: Record<string, string>;
}
