import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Module({
  imports: [],
  providers: [MigrationService],
  controllers: [],
  exports: [MigrationService],
})
export class MigrationModule {}
