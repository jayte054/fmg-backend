import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessoryEntity } from './accessoryEntity/accessoryEntity';
import { AccessoryRepository } from './accessoryRepository.ts/accessory.repository';
import { AccessoryService } from './accessoryService/accessory.service';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { CloudinaryModule } from '../cloudinaryModule/cloudinary.module';

@Module({
  imports: [
    AuditLogModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([AccessoryEntity]),
  ],
  providers: [
    AccessoryService,
    {
      provide: 'IAccessoryRepositoryInterface',
      useClass: AccessoryRepository,
    },
  ],
  controllers: [],
  exports: [],
})
export class AccessoryModule {}
