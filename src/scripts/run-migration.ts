import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../migrationUtils/migration.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);
  await migrationService.runMigrations();
  await app.close();
}

run().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
