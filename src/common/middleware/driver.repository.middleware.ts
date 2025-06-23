import { Injectable, NestMiddleware } from '@nestjs/common';
import { DriverEntityRepository } from 'src/modules/usersModule/repository/driver.entity.repository';

@Injectable()
export class DriverRepositoryMiddleware implements NestMiddleware {
  constructor(private readonly driverRepository: DriverEntityRepository) {}

  use(req: any, res: any, next: () => void) {
    req.driverRepository = this.driverRepository;
    next();
  }
}
