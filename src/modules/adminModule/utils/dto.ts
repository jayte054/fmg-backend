import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuditLogEntity } from 'src/modules/auditLogModule/auditLogEntity/auditLog.entity';

export class AuditLogFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdAt?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logCategory?: string;
  @ApiProperty()
  @IsNumberString()
  skip: number;
  @ApiProperty()
  @IsNumberString()
  take: number;
}

export class PaginatedLogResponseDto {
  @ApiProperty()
  @IsArray()
  data: AuditLogEntity[];
  @ApiProperty()
  @IsNumber()
  total: number;
  @ApiProperty()
  @IsNumber()
  page: number;
  @ApiProperty()
  @IsNumber()
  perPage: number;
}
