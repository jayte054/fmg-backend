import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAdminRepository } from '../interface/user.interface';
import { CreateAdminCredentials, CreateAdminDto } from '../utils/user.dto';
import { AdminEntity } from '../userEntity/admin.entity';
import { DuplicateException } from 'src/common/exceptions/exceptions';
import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';

@Injectable()
export class AdminService {
  private logger = new Logger(AdminService.name);
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  createAdmin = async (
    createAdminDto: CreateAdminDto,
    user: AuthEntity,
  ): Promise<AdminEntity> => {
    const { name, phoneNumber, location, address } = createAdminDto;
    const { email, role, isAdmin, id } = user;

    const input: CreateAdminCredentials = {
      name,
      phoneNumber,
      email,
      address,
      location,
      role,
      isAdmin,
      userId: id,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };

    const duplicateAdmin = await this.adminRepository.findAdmin(id);

    if (duplicateAdmin) {
      this.logger.log('duplicate admin');
      throw new DuplicateException('duplicate admin', { userId: id });
    }
    const newAdmin = await this.adminRepository.createAdmin(input);

    this.logger.verbose('admin profile created successfully');
    await this.auditLogService.log({
      logCategory: LogCategory.USER,
      description: 'buyer created',
      email: user.email,
      details: {
        message: 'buyer created successfully',
      },
    });
    return newAdmin;
  };
}
