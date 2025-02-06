import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { Repository } from 'typeorm';

export const GetDealerDecorator = createParamDecorator(
  async (Data: unknown, ctx: ExecutionContext): Promise<DealerEntity> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.dealerId) {
      throw new UnauthorizedException('Dealer unauthorized');
    }

    const dealerRepository: Repository<DealerEntity> = request.dealerRepository;

    const dealer = await dealerRepository.findOne({
      where: { dealerId: user.dealerId },
    });

    if (!dealer) {
      throw new UnauthorizedException('Dealer record not found');
    }

    return dealer;
  },
);
