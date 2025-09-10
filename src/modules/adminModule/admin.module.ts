import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { AdminController } from './adminController/admin.controller';
import { AdminRepositoryMiddleware } from 'src/common/middleware/admin.repository.middleware';
import { AdminAuditLogService } from './adminService/adminAuditLog.service';
import { AdminEntityRepository } from '../usersModule/repository/admin.entity.repository';

@Module({
  imports: [AuditLogModule],
  controllers: [AdminController],
  providers: [AdminAuditLogService, AdminEntityRepository],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminRepositoryMiddleware).forRoutes(AdminController);
  }
}
