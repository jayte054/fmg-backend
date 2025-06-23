import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DriverEntity } from 'src/modules/usersModule/userEntity/driver.entity';

export const GetDriverDecorator = createParamDecorator(
  async (Data: unknown, ctx: ExecutionContext): Promise<DriverEntity> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('Dealer unauthorized');
    }

    const driverRepository: Repository<DriverEntity> = request.driverRepository;

    const driver = await driverRepository.findOne({
      where: { userId: user.id },
    });
    if (!driver) {
      throw new UnauthorizedException('driver record not found');
    }

    return driver;
  },
);
