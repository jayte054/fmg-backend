import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { Repository } from 'typeorm';

export const GetBuyerDecorator = createParamDecorator(
  async (Data: unknown, ctx: ExecutionContext): Promise<BuyerEntity> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('buyer unauthorized');
    }

    const buyerRepository: Repository<BuyerEntity> = request.buyerRepository;

    const buyer = await buyerRepository.findOne({
      where: { userId: user.id },
    });
    if (!buyer) {
      throw new UnauthorizedException('buyer record not found');
    }

    return buyer;
  },
);
