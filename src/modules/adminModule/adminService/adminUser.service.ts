import { Injectable, Logger } from '@nestjs/common';
import { BuyerService } from 'src/modules/usersModule/service/buyer.service';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { BuyersFilterDto } from 'src/modules/usersModule/utils/user.dto';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(private readonly buyerService: BuyerService) {}

  fetchBuyers = async (admin: AdminEntity, filterDto: BuyersFilterDto) => {
    const buyers = await this.buyerService.findBuyers(filterDto, admin.adminId);

    return buyers;
  };
}
