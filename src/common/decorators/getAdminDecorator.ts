import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';
import { Repository } from 'typeorm';

export const GetAdminDecorator = createParamDecorator(
  async (Data: unknown, ctx: ExecutionContext): Promise<AdminEntity> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('unauthorized access');
    }

    const adminRepository: Repository<AdminEntity> = request.adminRepository;

    const admin = await adminRepository
      .createQueryBuilder('admin')
      .where('admin.userId = :userId', { userId: user.id })
      .getOne();

    if (!admin) {
      throw new UnauthorizedException('Admin record not found');
    }

    return admin;
  },
);
