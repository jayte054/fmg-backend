import { Injectable, NestMiddleware } from '@nestjs/common';
import { DealerEntityRepository } from '../../modules/usersModule/repository/dealer.entity.repository';

@Injectable()
export class DealerRepositoryMiddleware implements NestMiddleware {
  constructor(private readonly dealerRepository: DealerEntityRepository) {}

  use(req: any, res: any, next: () => void) {
    req.dealerRepository = this.dealerRepository;
    next();
  }
}
