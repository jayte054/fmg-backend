import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor() {}
}
