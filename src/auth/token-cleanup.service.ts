// src/auth/token-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly authService: AuthService) {}

  // Run cleanup every day at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanupExpiredTokens() {
    try {
      this.logger.log('Starting expired token cleanup...');
      
      const cleanedCount = await this.authService.cleanupExpiredTokens();
      
      this.logger.log(`Token cleanup completed. Removed ${cleanedCount} expired tokens.`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error);
    }
  }

  // Run cleanup every hour for more frequent cleanup during development
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCleanup() {
    try {
      const cleanedCount = await this.authService.cleanupExpiredTokens();
      
      if (cleanedCount > 0) {
        this.logger.log(`Hourly cleanup: Removed ${cleanedCount} expired tokens.`);
      }
    } catch (error) {
      this.logger.error('Failed to perform hourly token cleanup:', error);
    }
  }
}