import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseHealthService } from './services/database-health.service';
import { SystemHealthService } from './services/system-health.service';
import { 
  BasicHealthDto, 
  DetailedHealthDto, 
  HealthStatus,
  SecurityMetricsDto 
} from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly version = '1.0.0'; // Could be read from package.json

  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseHealth: DatabaseHealthService,
    private readonly systemHealth: SystemHealthService,
  ) {}

  /**
   * Get basic health status - lightweight and fast
   */
  async getBasicHealth(): Promise<BasicHealthDto> {
    try {
      const isSystemHealthy = this.systemHealth.isSystemHealthy();
      const uptime = this.systemHealth.getUptime();

      return {
        status: isSystemHealthy ? HealthStatus.UP : HealthStatus.DEGRADED,
        timestamp: new Date().toISOString(),
        uptime,
        version: this.version
      };
    } catch (error) {
      this.logger.error('Basic health check failed', error.message);
      return {
        status: HealthStatus.DOWN,
        timestamp: new Date().toISOString(),
        uptime: this.systemHealth.getUptime(),
        version: this.version
      };
    }
  }

  /**
   * Get comprehensive health status - detailed system analysis
   */
  async getDetailedHealth(): Promise<DetailedHealthDto> {
    try {
      this.logger.log('Starting detailed health check...');

      // Run all checks in parallel for better performance
      const [
        basicHealth,
        databaseHealth,
        systemMetrics,
        securityMetrics,
        endpointUsage
      ] = await Promise.all([
        this.getBasicHealth(),
        this.databaseHealth.checkDatabaseHealth(),
        this.systemHealth.getSystemMetrics(),
        this.getSecurityMetrics(),
        this.getEndpointUsage()
      ]);

      // Determine overall status based on all components
      const overallStatus = this.determineOverallStatus([
        basicHealth.status,
        databaseHealth.status
      ]);

      this.logger.log(`Detailed health check completed - Status: ${overallStatus}`);

      return {
        ...basicHealth,
        status: overallStatus,
        database: databaseHealth,
        system: systemMetrics,
        security: securityMetrics,
        endpointUsage
      };
    } catch (error) {
      this.logger.error('Detailed health check failed', error.message);
      
      // Return minimal health info on error
      const basicHealth = await this.getBasicHealth();
      return {
        ...basicHealth,
        status: HealthStatus.DOWN,
        database: {
          status: HealthStatus.DOWN,
          responseTime: -1,
          type: 'postgresql',
          connected: false
        },
        system: await this.systemHealth.getSystemMetrics(),
        security: {
          activeSessions: 0,
          rateLimitViolations: 0,
          failedLogins: 0,
          lockedAccounts: 0
        },
        endpointUsage: {}
      };
    }
  }

  /**
   * Get security-related metrics
   */
  private async getSecurityMetrics(): Promise<SecurityMetricsDto> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [activeSessions, lockedAccounts] = await Promise.all([
        // Count active sessions (users with recent refresh tokens)
        this.prisma.user.count({
          where: {
            refreshTokens: {
              some: {
                createdAt: { gte: oneHourAgo }
              }
            }
          }
        }),
        // Count locked accounts
        this.prisma.user.count({
          where: {
            lockedUntil: { gt: new Date() }
          }
        })
      ]);

      // These would be tracked in production with proper monitoring
      const rateLimitViolations = Math.floor(Math.random() * 20); // Mock data
      const failedLogins = Math.floor(Math.random() * 10); // Mock data

      return {
        activeSessions,
        rateLimitViolations,
        failedLogins,
        lockedAccounts
      };
    } catch (error) {
      this.logger.error('Failed to get security metrics', error.message);
      return {
        activeSessions: 0,
        rateLimitViolations: 0,
        failedLogins: 0,
        lockedAccounts: 0
      };
    }
  }

  /**
   * Get API endpoint usage statistics
   * In production, this would be tracked with proper analytics
   */
  private async getEndpointUsage(): Promise<Record<string, number>> {
    // Mock data - in production you'd track this with middleware/analytics
    return {
      '/auth/login': Math.floor(Math.random() * 2000) + 1000,
      '/auth/register': Math.floor(Math.random() * 500) + 200,
      '/auth/refresh': Math.floor(Math.random() * 1500) + 800,
      '/users/me': Math.floor(Math.random() * 1000) + 500,
      '/health': Math.floor(Math.random() * 100) + 50,
      '/health/detailed': Math.floor(Math.random() * 50) + 10
    };
  }

  /**
   * Determine overall system status based on component statuses
   */
  private determineOverallStatus(statuses: HealthStatus[]): HealthStatus {
    if (statuses.includes(HealthStatus.DOWN)) {
      return HealthStatus.DOWN;
    }
    
    if (statuses.includes(HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.UP;
  }
}