import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { AdminAuditLogService } from '../adminService/adminAuditLog.service';
import { GetAdminDecorator } from 'src/common/decorators/getAdminDecorator';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { AuditLogFilterDto, PaginatedLogResponseDto } from '../utils/dto';
import { AuditLogEntity } from 'src/modules/auditLogModule/auditLogEntity/auditLog.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminAuditLogService: AdminAuditLogService) {}

  @Get('fetchAuditLogs')
  @ApiOperation({ summary: 'fetch list of audit logs' })
  @ApiResponse({
    status: 201,
    description: 'audit logs fetched successfully',
    type: PaginatedLogResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findLogs(
    @GetAdminDecorator() admin: AdminEntity,
    @Query() filterDto: AuditLogFilterDto,
  ) {
    return await this.adminAuditLogService.fetchAuditLogs(admin, filterDto);
  }

  @Get('fetchAuditLog')
  @ApiOperation({ summary: 'fetch audit log' })
  @ApiResponse({
    status: 201,
    description: 'audit log fetched successfully',
    type: AuditLogEntity,
  })
  @HttpCode(HttpStatus.OK)
  async fetchLog(
    @GetAdminDecorator() admin: AdminEntity,
    @Param('logId') logId: string,
  ) {
    return await this.adminAuditLogService.fetchAuditLog(admin, logId);
  }
}
