import { Injectable, Logger } from '@nestjs/common';
import { AppDataSource } from '../typeormconfig/data-source';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  async runMigrations(): Promise<void> {
    try {
      await AppDataSource.initialize();
      this.logger.log('Datasource initialized');

      const result = await AppDataSource.runMigrations();
      this.logger.log('Migrations executed successfully:', result);
    } catch (error) {
      this.logger.error('Migration failed', error.stack);
      throw error;
    } finally {
      await AppDataSource.destroy();
      this.logger.log('DataSource closed');
    }
  }

  async revertLastMigrations(): Promise<void> {
    try {
      await AppDataSource.initialize();
      this.logger.log('DataSource initialized');

      const result = await AppDataSource.undoLastMigration();
      this.logger.log('Migration reverted successfully:', result);
    } catch (error) {
      this.logger.error('Revert failed', error.stack);
      throw error;
    } finally {
      await AppDataSource.destroy();
      this.logger.log('DataSource closed');
    }
  }
}
