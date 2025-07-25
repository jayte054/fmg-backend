import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminEntity } from '../userEntity/admin.entity';
import { DataSource, Repository } from 'typeorm';
import {
  AdminFilter,
  CreateAdminCredentials,
  UpdateFilter,
} from '../utils/user.dto';
import { AdminResponse } from '../utils/user.types';

@Injectable()
export class AdminRepository extends Repository<AdminEntity> {
  private logger = new Logger('AdminRepository');
  constructor(private dataSource: DataSource) {
    super(AdminEntity, dataSource.createEntityManager());
  }

  createAdmin = async (input: CreateAdminCredentials): Promise<AdminEntity> => {
    const admin = this.create(input);
    const newAdmin = await this.save(admin);
    return newAdmin;
  };

  findAdmins = async (filter: AdminFilter): Promise<AdminResponse> => {
    const { search, active, skip, take } = filter;
    const query = this.createQueryBuilder('admin');

    if (search) {
      const lowerCaseSearch = `%${search.toLowerCase()}%`;
      query.andWhere(`LOWER(admin.location) ILIKE :lowerCaseSearch`, {
        lowerCaseSearch,
      });
    }

    if (active) {
      query.andWhere('admin.active = :active', { active });
    }

    const [admins, total] = await query.skip(skip).take(take).getManyAndCount();

    return {
      admins,
      total,
    };
  };

  findAdminByUserId = async (userId: string): Promise<AdminEntity> => {
    const query = this.createQueryBuilder('admin');

    query.where('admin.userId = :userId', { userId });

    return await query.getOne();
  };

  findAdmin = async (adminId: string): Promise<AdminEntity> => {
    const query = this.createQueryBuilder('admin');

    query.where('admin.adminId = :adminId', { adminId });

    return await query.getOne();
  };

  updateAdmin = async (userId: string, data: UpdateFilter) => {
    const response = await this.update({ userId }, data);

    if (response.affected === 0) {
      throw new NotFoundException('user not found');
    }

    return {
      admin: await this.findOne({ where: { userId } }),
      message: 'admin updated successfully',
    };
  };
}
