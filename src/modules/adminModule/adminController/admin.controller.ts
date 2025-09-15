import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { AdminAuditLogService } from '../adminService/adminAuditLog.service';
import { GetAdminDecorator } from 'src/common/decorators/getAdminDecorator';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { AuditLogFilterDto, PaginatedLogResponseDto } from '../utils/dto';
import { AuditLogEntity } from 'src/modules/auditLogModule/auditLogEntity/auditLog.entity';
import {
  AdminPaymentFilterDto,
  BuyerPaymentResponseDto,
  PaginatedPaymentResponseDto,
  PaginatedRevenueResponseDto,
  RevenueFilterDto,
  RevenueResponseDto,
  TotalRevenueDto,
} from 'src/modules/paymentModule/utils/payment.dto';
import { AdminPaymentService } from '../adminService/adminPayment.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminAuditLogService: AdminAuditLogService,
    private readonly adminPaymentService: AdminPaymentService,
  ) {}

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

  @Get('payments')
  @ApiOperation({ summary: 'view payments' })
  @ApiResponse({
    status: 200,
    description: 'payments fetched successfully',
    type: PaginatedPaymentResponseDto,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'createdAt', required: false, type: Date })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'skip', required: true, type: Number })
  @ApiQuery({ name: 'take', required: true, type: Number })
  @HttpCode(HttpStatus.OK)
  async viewPayments(
    @GetAdminDecorator() admin: AdminEntity,
    @Query() paymentFilter: AdminPaymentFilterDto,
  ) {
    return await this.adminPaymentService.viewPayments(admin, paymentFilter);
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'view payment' })
  @ApiResponse({
    status: 200,
    description: 'payment fetched successfully',
    type: BuyerPaymentResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async viewPayment(
    @GetAdminDecorator() admin: AdminEntity,
    @Param('paymentId') paymentId: string,
  ) {
    return await this.adminPaymentService.viewPayment(admin, paymentId);
  }

  @Get('revenueHistory')
  @ApiOperation({ summary: 'fetch revenue history' })
  @ApiResponse({
    status: 200,
    description: 'revenue history fetched successfully',
    type: PaginatedRevenueResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async fetchRevenueHistory(
    @GetAdminDecorator() admin: AdminEntity,
    @Query() filterDto: RevenueFilterDto,
  ) {
    return await this.adminPaymentService.fetchRevenueHistory(admin, filterDto);
  }

  @Get('/revenue/:revenueId')
  @ApiOperation({ summary: 'fetch revenue detail' })
  @ApiResponse({
    status: 200,
    description: 'revenue detail fetched successfully',
    type: RevenueResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async fetchRevenue(
    @GetAdminDecorator() admin: AdminEntity,
    @Param('revenueId') revenueId: string,
  ) {
    return await this.adminPaymentService.fetchRevenue(admin, revenueId);
  }

  @Get('calculateRevenue')
  @ApiOperation({ summary: 'calculate total revenue' })
  @ApiResponse({
    status: 200,
    description: 'revenue calculation fetched successfully',
    type: TotalRevenueDto,
  })
  @HttpCode(HttpStatus.OK)
  async fetchTotalRevenue(@GetAdminDecorator() admin: AdminEntity) {
    return await this.adminPaymentService.fetchTotalRevenue(admin);
  }
}
