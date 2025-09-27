import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthService } from './services/database-health.service';
import { SystemHealthService } from './services/system-health.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthService,
    SystemHealthService,
  ],
  exports: [HealthService], // Export for use in other modules if needed
})
export class HealthModule {}