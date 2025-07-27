import { Injectable, NestMiddleware } from '@nestjs/common';
import { AdminEntityRepository } from 'src/modules/usersModule/repository/admin.entity.repository';

@Injectable()
export class AdminRepositoryMiddleware implements NestMiddleware {
  constructor(private readonly adminRepository: AdminEntityRepository) {}

  use(req: any, res: any, next: () => void) {
    req.adminRepository = this.adminRepository;
    next();
  }
}
