import { DataSource, Repository } from 'typeorm';
import { AdminEntity } from '../userEntity/admin.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminEntityRepository extends Repository<AdminEntity> {
  constructor(private dataSource: DataSource) {
    super(AdminEntity, dataSource.createEntityManager());
  }

  async findAdminByEmail(email: string): Promise<AdminEntity> {
    return this.findOne({ where: { email } });
  }
}
