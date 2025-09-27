import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DatabaseHealthDto, HealthStatus } from '../dto/health-response.dto';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check database connectivity and performance
   */
  async checkDatabaseHealth(): Promise<DatabaseHealthDto> {
    try {
      const startTime = Date.now();
      
      // Simple connectivity test with a lightweight query
      await this.prisma.$queryRaw`SELECT 1`;
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.log(`Database health check completed in ${responseTime}ms`);

      return {
        status: responseTime < 100 ? HealthStatus.UP : HealthStatus.DEGRADED,
        responseTime,
        type: 'postgresql',
        connected: true
      };
    } catch (error) {
      this.logger.error('Database health check failed', error.message);
      
      return {
        status: HealthStatus.DOWN,
        responseTime: -1,
        type: 'postgresql',
        connected: false
      };
    }
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(): Promise<{
    totalUsers: number;
    activeConnections: number;
    lastBackup?: string;
  }> {
    try {
      const totalUsers = await this.prisma.user.count();
      
      // Get active sessions count (approximate)
      const activeSessions = await this.prisma.user.count({
        where: {
          refreshTokens: {
            some: {
              // Tokens created in the last 24 hours (active sessions)
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      });

      return {
        totalUsers,
        activeConnections: activeSessions,
        lastBackup: 'N/A' // Would be implemented based on backup strategy
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error.message);
      return {
        totalUsers: 0,
        activeConnections: 0,
        lastBackup: 'Error'
      };
    }
  }
}