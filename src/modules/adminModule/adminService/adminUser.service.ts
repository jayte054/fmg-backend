import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { BuyerService } from 'src/modules/usersModule/service/buyer.service';
import { DriverService } from 'src/modules/usersModule/service/driver.service';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import {
  BuyersFilterDto,
  DriverFilterDto,
} from 'src/modules/usersModule/utils/user.dto';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(
    private readonly buyerService: BuyerService,
    private readonly auditLogService: AuditLogService,
    private readonly driverService: DriverService,
  ) {}

  fetchBuyers = async (admin: AdminEntity, filterDto: BuyersFilterDto) => {
    const buyers = await this.buyerService.findBuyers(filterDto, admin.adminId);

    return buyers;
  };

  fetchBuyer = async (admin: AdminEntity, buyerId: string) => {
    const buyer = await this.buyerService.findBuyer(buyerId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched buyer',
      email: buyer.email,
      details: {
        admin: admin.adminId,
        buyerId,
      },
    });

    this.logger.log('buyer fetched successfully by ', admin.adminId);
    return buyer;
  };

  fetchDrivers = async (admin: AdminEntity, filterDto: DriverFilterDto) => {
    const drivers = await this.driverService.findDrivers(filterDto);

    if (drivers.total === 0) {
      this.auditLogService.error({
        logCategory: LogCategory.Admin,
        description: 'fetched drivers',
        email: admin.email,
        details: {
          filterDto: JSON.stringify(filterDto),
        },
        status: HttpStatus.NO_CONTENT,
      });
      return drivers;
    }
    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched drivers',
      email: admin.email,
      details: {
        filterDto: JSON.stringify(filterDto),
      },
    });
    this.logger.log('drivers fetched by admin ', admin.adminId);

    return drivers;
  };

  fetchDriver = async (admin: AdminEntity, driverId: string) => {
    const driver = await this.driverService.findDriverByService(driverId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched drivers',
      email: admin.email,
      details: {
        driverId,
        adminId: admin.adminId,
      },
    });

    this.logger.log('driver fetched by admin', admin.adminId);
    return driver;
  };
}
