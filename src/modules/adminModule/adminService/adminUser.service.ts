import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { BuyerService } from 'src/modules/usersModule/service/buyer.service';
import { DealerService } from 'src/modules/usersModule/service/dealer.service';
import { DriverService } from 'src/modules/usersModule/service/driver.service';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import {
  BuyersFilterDto,
  DealersFilterDto,
  DriverFilterDto,
} from 'src/modules/usersModule/utils/user.dto';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(
    private readonly buyerService: BuyerService,
    private readonly auditLogService: AuditLogService,
    private readonly driverService: DriverService,
    private readonly dealerService: DealerService,
  ) {}

  fetchBuyers = async (admin: AdminEntity, filterDto: BuyersFilterDto) => {
    const buyers = await this.buyerService.findBuyers(filterDto, admin.adminId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched buyers',
      email: admin.email,
      details: {
        count: buyers.data.total.toString(),
        admin: admin.adminId,
      },
    });

    return buyers;
  };

  fetchBuyer = async (admin: AdminEntity, buyerId: string) => {
    const buyer = await this.buyerService.findBuyer(buyerId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched buyer',
      email: buyer.data.email,
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

    if (drivers.data.total === 0) {
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

  fetchDealers = async (admin: AdminEntity, filterDto: DealersFilterDto) => {
    const dealers = await this.dealerService.findDealers(filterDto);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched dealers',
      email: admin.email,
      details: {
        adminId: admin.adminId,
        count: dealers.data.total.toString(),
      },
    });

    return dealers;
  };

  fetchDealer = async (admin: AdminEntity, dealerId: string) => {
    const dealer = await this.dealerService.findDealerByService(dealerId);

    this.auditLogService.log({
      logCategory: LogCategory.Admin,
      description: 'fetched dealer',
      email: admin.email,
      details: {
        adminId: admin.adminId,
        dealerId: dealer.data.dealerId,
      },
    });

    return dealer;
  };
}
