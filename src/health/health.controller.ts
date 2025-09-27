import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { BasicHealthDto, DetailedHealthDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: `
**🏥 Quick System Health Check**

Lightweight endpoint for basic system status monitoring.
Perfect for load balancers and uptime monitoring.

**✨ Features:**
• Instant response
• System uptime
• API version info
• Overall status indicator
• No authentication required

**🚀 Use Cases:**
• Load balancer health checks
• Uptime monitoring
• CI/CD pipeline validation
• Quick system status verification
    `
  })
  @ApiResponse({
    status: 200,
    description: '✅ System is healthy',
    type: BasicHealthDto,
    examples: {
      healthy: {
        summary: 'Healthy System - Running normally',
        value: {
          status: 'UP',
          timestamp: '2024-01-15T14:30:00.000Z',
          uptime: 1847392,
          version: '1.0.0'
        }
      },
      degraded: {
        summary: 'Degraded Performance - Performance issues detected',
        value: {
          status: 'DEGRADED',
          timestamp: '2024-01-15T14:30:00.000Z',
          uptime: 1847392,
          version: '1.0.0'
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: '❌ System is unhealthy',
    schema: {
      example: {
        status: 'DOWN',
        timestamp: '2024-01-15T14:30:00.000Z',
        uptime: 1847392,
        version: '1.0.0'
      }
    }
  })
  async getHealth(): Promise<BasicHealthDto> {
    return this.healthService.getBasicHealth();
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Comprehensive system health analysis',
    description: `
**📊 Detailed System Health & Performance Report**

Comprehensive health check with detailed system metrics, database status,
security information, and performance analytics.

**✨ Includes:**
• 🔍 System performance metrics
• 💾 Database connectivity & response times
• 🛡️ Security statistics (sessions, failed logins)
• 📈 API endpoint usage analytics
• 🖥️ Server resource utilization
• ⚡ Real-time performance data

**👑 Perfect for:**
• System administrators
• DevOps monitoring
• Performance analysis
• Security auditing
• Capacity planning
    `
  })
  @ApiResponse({
    status: 200,
    description: '📈 Comprehensive health report',
    type: DetailedHealthDto,
    examples: {
      comprehensive: {
        summary: 'Full System Report - Complete health analysis with all metrics',
        value: {
          status: 'UP',
          timestamp: '2024-01-15T14:30:00.000Z',
          uptime: 1847392,
          version: '1.0.0',
          database: {
            status: 'UP',
            responseTime: 23,
            type: 'postgresql',
            connected: true
          },
          system: {
            memory: {
              used: 128.5,
              total: 512.0,
              percentage: 25.1
            },
            cpu: {
              user: 15.2,
              system: 8.7,
              total: 23.9
            },
            nodeVersion: 'v18.17.0',
            platform: 'linux'
          },
          security: {
            activeSessions: 247,
            rateLimitViolations: 12,
            failedLogins: 3,
            lockedAccounts: 1
          },
          endpointUsage: {
            '/auth/login': 1547,
            '/auth/register': 234,
            '/users/me': 892,
            '/health': 45
          }
        }
      }
    }
  })
  async getDetailedHealth(): Promise<DetailedHealthDto> {
    return this.healthService.getDetailedHealth();
  }

  @Get('database')
  @ApiOperation({
    summary: 'Database connectivity check',
    description: `
**💾 Database Health & Performance Check**

Focused endpoint for database connectivity and performance monitoring.
Includes response time analysis and connection status.

**✨ Features:**
• Connection status verification
• Response time measurement
• Database type identification
• Performance benchmarking
    `
  })
  @ApiResponse({
    status: 200,
    description: '💾 Database status information',
    schema: {
      examples: {
        healthy: {
          summary: 'Database Healthy',
          value: {
            status: 'UP',
            responseTime: 23,
            type: 'postgresql',
            connected: true,
            stats: {
              totalUsers: 1247,
              activeConnections: 34,
              lastBackup: 'N/A'
            }
          }
        },
        slow: {
          summary: 'Database Slow',
          value: {
            status: 'DEGRADED',
            responseTime: 156,
            type: 'postgresql',
            connected: true,
            stats: {
              totalUsers: 1247,
              activeConnections: 89,
              lastBackup: 'N/A'
            }
          }
        }
      }
    }
  })
  async getDatabaseHealth() {
    const [health, stats] = await Promise.all([
      this.healthService['databaseHealth'].checkDatabaseHealth(),
      this.healthService['databaseHealth'].getDatabaseStats()
    ]);

    return {
      ...health,
      stats
    };
  }
}