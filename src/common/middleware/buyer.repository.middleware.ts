import { Injectable, NestMiddleware } from '@nestjs/common';
import { BuyerEntityRepository } from '../../modules/usersModule/repository/buyer.entity.repository';

@Injectable()
export class BuyerRepositoryMiddleware implements NestMiddleware {
  constructor(private readonly buyerRepository: BuyerEntityRepository) {}

  use(req: any, res: any, next: () => void) {
    req.buyerRepository = this.buyerRepository;
    next();
  }
}
