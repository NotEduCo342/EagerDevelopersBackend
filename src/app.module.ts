// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CacheConfigModule } from './config/cache.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // <-- Add ScheduleModule
    CacheConfigModule, // Phase 5.1: Redis caching configuration
    // --- THROTTLER CONFIGURATION ---
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds (in milliseconds)
        limit: 10, // 10 requests per ttl
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    AdminModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // --- APPLY THROTTLER GUARD GLOBALLY ---
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}