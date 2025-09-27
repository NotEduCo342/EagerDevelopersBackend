import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED'
}

export class BasicHealthDto {
  @ApiProperty({ 
    example: 'UP',
    description: 'Overall system health status',
    enum: HealthStatus
  })
  status: HealthStatus;

  @ApiProperty({ 
    example: '2024-01-15T14:30:00.000Z',
    description: 'Timestamp of health check'
  })
  timestamp: string;

  @ApiProperty({ 
    example: 123456789,
    description: 'System uptime in milliseconds'
  })
  uptime: number;

  @ApiProperty({ 
    example: '1.0.0',
    description: 'API version'
  })
  version: string;
}

export class DatabaseHealthDto {
  @ApiProperty({ 
    example: 'UP',
    description: 'Database connection status',
    enum: HealthStatus
  })
  status: HealthStatus;

  @ApiProperty({ 
    example: 23,
    description: 'Database response time in milliseconds'
  })
  responseTime: number;

  @ApiProperty({ 
    example: 'postgresql',
    description: 'Database type'
  })
  type: string;

  @ApiProperty({ 
    example: true,
    description: 'Whether database is connected'
  })
  connected: boolean;
}

export class SystemMetricsDto {
  @ApiProperty({ 
    example: { used: 128.5, total: 512.0, percentage: 25.1 },
    description: 'Memory usage statistics in MB'
  })
  memory: {
    used: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({ 
    example: { user: 15.2, system: 8.7, total: 23.9 },
    description: 'CPU usage statistics as percentages'
  })
  cpu: {
    user: number;
    system: number;
    total: number;
  };

  @ApiProperty({ 
    example: 'v18.17.0',
    description: 'Node.js version'
  })
  nodeVersion: string;

  @ApiProperty({ 
    example: 'linux',
    description: 'Operating system platform'
  })
  platform: string;
}

export class SecurityMetricsDto {
  @ApiProperty({ 
    example: 247,
    description: 'Number of active user sessions'
  })
  activeSessions: number;

  @ApiProperty({ 
    example: 12,
    description: 'Rate limit violations in the last hour'
  })
  rateLimitViolations: number;

  @ApiProperty({ 
    example: 3,
    description: 'Failed authentication attempts in the last hour'
  })
  failedLogins: number;

  @ApiProperty({ 
    example: 1,
    description: 'Number of currently locked accounts'
  })
  lockedAccounts: number;
}

export class DetailedHealthDto extends BasicHealthDto {
  @ApiProperty({ 
    description: 'Database health information',
    type: DatabaseHealthDto
  })
  database: DatabaseHealthDto;

  @ApiProperty({ 
    description: 'System performance metrics',
    type: SystemMetricsDto
  })
  system: SystemMetricsDto;

  @ApiProperty({ 
    description: 'Security and authentication metrics',
    type: SecurityMetricsDto
  })
  security: SecurityMetricsDto;

  @ApiProperty({ 
    example: {
      '/auth/login': 1547,
      '/auth/register': 234,
      '/users/me': 892,
      '/health': 45
    },
    description: 'API endpoint usage statistics'
  })
  endpointUsage: Record<string, number>;
}