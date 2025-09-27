import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheConfigModule } from '../config/cache.module';

@Module({
  imports: [
    PrismaModule, // For database access
    CacheConfigModule, // Redis caching configuration
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsCacheService, // Phase 5.1: Intelligent caching service
    // BackgroundJobService will be added in Phase 5.2
  ],
  exports: [AnalyticsService, AnalyticsCacheService], // Export for use in other modules
})
export class AnalyticsModule {
  constructor() {
    // Module initialization logic will be added here
    console.log('📊 Analytics Module initialized - Ready for enterprise-grade business intelligence!');
  }
}