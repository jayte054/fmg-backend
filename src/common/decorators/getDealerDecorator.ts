import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DealerEntity } from '../../modules/usersModule/userEntity/dealerEntity';
import { Repository } from 'typeorm';

export const GetDealerDecorator = createParamDecorator(
  async (Data: unknown, ctx: ExecutionContext): Promise<DealerEntity> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('Dealer unauthorized');
    }

    const dealerRepository: Repository<DealerEntity> = request.dealerRepository;

    const dealer = await dealerRepository.findOne({
      where: { userId: user.id },
    });
    if (!dealer) {
      throw new UnauthorizedException('Dealer record not found');
    }

    return dealer;
  },
);
