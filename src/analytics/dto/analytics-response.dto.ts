import { ApiProperty } from '@nestjs/swagger';

// ===== CORE ANALYTICS INTERFACES =====

export class AnalyticsOverviewDto {
  @ApiProperty({ 
    example: 1247,
    description: 'Total number of registered users'
  })
  totalUsers: number;

  @ApiProperty({ 
    example: 23,
    description: 'New users registered today'
  })
  newUsersToday: number;

  @ApiProperty({ 
    example: 156,
    description: 'New users registered this week'
  })
  newUsersThisWeek: number;

  @ApiProperty({ 
    example: 342,
    description: 'Active users in the last 24 hours'
  })
  activeUsers24h: number;

  @ApiProperty({ 
    example: 1205,
    description: 'Active users in the last 7 days'
  })
  activeUsers7d: number;

  @ApiProperty({ 
    example: '+12.5%',
    description: 'User growth rate compared to previous period'
  })
  userGrowthRate: string;

  @ApiProperty({ 
    example: 45678,
    description: 'Total API requests in the last 24 hours'
  })
  apiCallsToday: number;

  @ApiProperty({ 
    example: 156,
    description: 'Average response time in milliseconds'
  })
  averageResponseTime: number;

  @ApiProperty({ 
    example: 0.12,
    description: 'Error rate percentage (0-100)'
  })
  errorRate: number;

  @ApiProperty({ 
    example: 'excellent',
    description: 'Overall system health status',
    enum: ['excellent', 'good', 'warning', 'critical']
  })
  systemHealth: string;

  @ApiProperty({ 
    example: 94,
    description: 'Security score out of 100'
  })
  securityScore: number;
}

export class UserAnalyticsDto {
  @ApiProperty({ 
    example: 1247,
    description: 'Total registered users'
  })
  totalUsers: number;

  @ApiProperty({ 
    example: 23,
    description: 'New users today'
  })
  newUsersToday: number;

  @ApiProperty({ 
    example: 156,
    description: 'New users this week'
  })
  newUsersThisWeek: number;

  @ApiProperty({ 
    example: 789,
    description: 'New users this month'
  })
  newUsersThisMonth: number;

  @ApiProperty({ 
    example: { active: 1180, locked: 45, admin: 22 },
    description: 'User distribution by status'
  })
  usersByStatus: {
    active: number;
    locked: number;
    admin: number;
  };

  @ApiProperty({ 
    type: [Object],
    example: [
      { date: '2024-09-20', count: 45 },
      { date: '2024-09-21', count: 52 },
      { date: '2024-09-22', count: 38 }
    ],
    description: 'Daily user registration trends'
  })
  registrationTrends: Array<{
    date: string;
    count: number;
  }>;

  @ApiProperty({ 
    example: { desktop: 67, mobile: 28, tablet: 5 },
    description: 'User distribution by device type'
  })
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };

  @ApiProperty({ 
    example: 1245,
    description: 'Average session duration in seconds'
  })
  averageSessionDuration: number;
}

export class ActivityAnalyticsDto {
  @ApiProperty({ 
    example: 342,
    description: 'Daily active users'
  })
  dailyActiveUsers: number;

  @ApiProperty({ 
    example: 1205,
    description: 'Weekly active users'
  })
  weeklyActiveUsers: number;

  @ApiProperty({ 
    example: 1180,
    description: 'Monthly active users'
  })
  monthlyActiveUsers: number;

  @ApiProperty({ 
    example: 1245,
    description: 'Average session duration in seconds'
  })
  averageSessionDuration: number;

  @ApiProperty({ 
    example: 890,
    description: 'Median session duration in seconds'
  })
  medianSessionDuration: number;

  @ApiProperty({ 
    type: [Object],
    example: [
      { hour: 9, users: 123 },
      { hour: 14, users: 145 },
      { hour: 20, users: 98 }
    ],
    description: 'Peak activity hours with user counts'
  })
  peakHours: Array<{
    hour: number;
    users: number;
  }>;

  @ApiProperty({ 
    type: [Object],
    example: [
      { endpoint: '/api/users', requests: 2456, avgResponseTime: 145 },
      { endpoint: '/api/auth/login', requests: 1890, avgResponseTime: 234 }
    ],
    description: 'Most popular API endpoints'
  })
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    avgResponseTime: number;
  }>;

  @ApiProperty({ 
    type: [Object],
    example: [
      { feature: 'User Dashboard', usage: 1456, engagement: 0.87 },
      { feature: 'Profile Management', usage: 1234, engagement: 0.72 }
    ],
    description: 'Feature usage statistics'
  })
  featureUsage: Array<{
    feature: string;
    usage: number;
    engagement: number;
  }>;
}

export class SecurityAnalyticsDto {
  @ApiProperty({ 
    example: 94,
    description: 'Overall security score (0-100)'
  })
  securityScore: number;

  @ApiProperty({ 
    example: 23,
    description: 'Failed login attempts in the last 24 hours'
  })
  failedLoginAttempts24h: number;

  @ApiProperty({ 
    example: 5,
    description: 'Currently locked accounts'
  })
  lockedAccounts: number;

  @ApiProperty({ 
    example: 2,
    description: 'Suspicious activity incidents'
  })
  suspiciousActivity: number;

  @ApiProperty({ 
    example: 97.8,
    description: 'Login success rate percentage'
  })
  loginSuccessRate: number;

  @ApiProperty({ 
    example: { weak: 12, medium: 445, strong: 790 },
    description: 'Password strength distribution'
  })
  passwordStrengthDistribution: {
    weak: number;
    medium: number;
    strong: number;
  };

  @ApiProperty({ 
    type: [Object],
    example: [
      { type: 'multiple_failed_logins', count: 3, severity: 'medium' },
      { type: 'unusual_location', count: 1, severity: 'high' }
    ],
    description: 'Security alerts by type and severity'
  })
  securityAlerts: Array<{
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;

  @ApiProperty({ 
    type: [Object],
    example: [
      { country: 'United States', percentage: 45.2 },
      { country: 'Canada', percentage: 23.8 },
      { country: 'United Kingdom', percentage: 15.4 }
    ],
    description: 'Geographic distribution of login attempts'
  })
  geographicDistribution: Array<{
    country: string;
    percentage: number;
  }>;
}

export class SystemAnalyticsDto {
  @ApiProperty({ 
    example: 'excellent',
    description: 'Overall system health status',
    enum: ['excellent', 'good', 'warning', 'critical']
  })
  systemHealth: string;

  @ApiProperty({ 
    example: { average: 156, p95: 298, p99: 445 },
    description: 'Response time metrics in milliseconds'
  })
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };

  @ApiProperty({ 
    example: 45678,
    description: 'API usage in the last 24 hours'
  })
  apiUsage24h: number;

  @ApiProperty({ 
    example: 0.12,
    description: 'System error rate percentage'
  })
  errorRate: number;

  @ApiProperty({ 
    example: { connectionPool: 85, queryTime: 23, activeConnections: 12 },
    description: 'Database performance metrics'
  })
  databasePerformance: {
    connectionPool: number;
    queryTime: number;
    activeConnections: number;
  };

  @ApiProperty({ 
    example: { cpu: 34, memory: 67, storage: 23 },
    description: 'System resource utilization percentages'
  })
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };

  @ApiProperty({ 
    type: [Object],
    example: [
      { timestamp: '2024-09-27T10:00:00Z', cpu: 35, memory: 68 },
      { timestamp: '2024-09-27T11:00:00Z', cpu: 42, memory: 71 }
    ],
    description: 'Historical system performance data'
  })
  performanceHistory: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    responseTime?: number;
  }>;
}

export class TrendAnalyticsDto {
  @ApiProperty({ 
    example: 'daily',
    description: 'Time period for trend analysis',
    enum: ['hourly', 'daily', 'weekly', 'monthly']
  })
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ 
    example: '2024-09-20',
    description: 'Start date for trend analysis'
  })
  startDate: string;

  @ApiProperty({ 
    example: '2024-09-27',
    description: 'End date for trend analysis'
  })
  endDate: string;

  @ApiProperty({ 
    type: [Object],
    example: [
      { date: '2024-09-20', users: 1156, sessions: 2341, requests: 45678 },
      { date: '2024-09-21', users: 1203, sessions: 2456, requests: 47234 }
    ],
    description: 'Trending data points over time'
  })
  trendData: Array<{
    date: string;
    users: number;
    sessions: number;
    requests: number;
    responseTime?: number;
    errorRate?: number;
  }>;

  @ApiProperty({ 
    example: { userGrowth: '+8.3%', sessionGrowth: '+12.1%', performanceChange: '-5.2%' },
    description: 'Percentage changes compared to previous period'
  })
  periodComparison: {
    userGrowth: string;
    sessionGrowth: string;
    performanceChange: string;
  };
}

export class AnalyticsExportDto {
  @ApiProperty({ 
    example: 'csv',
    description: 'Export format',
    enum: ['csv', 'json', 'excel']
  })
  format: 'csv' | 'json' | 'excel';

  @ApiProperty({ 
    example: 'overview',
    description: 'Type of analytics data to export',
    enum: ['overview', 'users', 'activity', 'security', 'system', 'trends']
  })
  dataType: 'overview' | 'users' | 'activity' | 'security' | 'system' | 'trends';

  @ApiProperty({ 
    example: '2024-09-20',
    description: 'Start date for export data range'
  })
  startDate: string;

  @ApiProperty({ 
    example: '2024-09-27',
    description: 'End date for export data range'
  })
  endDate: string;

  @ApiProperty({ 
    example: ['users', 'sessions', 'responseTime'],
    description: 'Specific fields to include in export'
  })
  fields?: string[];
}

export class AnalyticsExportResponseDto {
  @ApiProperty({ 
    example: 'analytics_overview_2024-09-27.csv',
    description: 'Generated filename for the export'
  })
  filename: string;

  @ApiProperty({ 
    example: 1024,
    description: 'Size of exported data in bytes'
  })
  fileSize: number;

  @ApiProperty({ 
    example: 'https://api.eagerdevelopers.com/exports/analytics_overview_2024-09-27.csv',
    description: 'Download URL for the exported file'
  })
  downloadUrl: string;

  @ApiProperty({ 
    example: '2024-09-27T14:30:00.000Z',
    description: 'Timestamp when export was generated'
  })
  generatedAt: string;

  @ApiProperty({ 
    example: '2024-09-27T15:30:00.000Z',
    description: 'Expiration time for the download URL'
  })
  expiresAt: string;
}

// ===== TIME SERIES DATA INTERFACES =====

export class TimeSeriesDataPoint {
  @ApiProperty({ 
    example: '2024-09-27T14:00:00.000Z',
    description: 'Timestamp for the data point'
  })
  timestamp: string;

  @ApiProperty({ 
    example: 123,
    description: 'Numeric value for this time point'
  })
  value: number;

  @ApiProperty({ 
    example: { users: 342, sessions: 567 },
    description: 'Additional metadata for this data point'
  })
  metadata?: Record<string, any>;
}

export class ChartDataDto {
  @ApiProperty({ 
    example: 'User Growth Over Time',
    description: 'Chart title'
  })
  title: string;

  @ApiProperty({ 
    example: 'line',
    description: 'Chart type for frontend visualization',
    enum: ['line', 'bar', 'pie', 'area', 'scatter']
  })
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter';

  @ApiProperty({ 
    type: [TimeSeriesDataPoint],
    description: 'Array of data points for the chart'
  })
  data: TimeSeriesDataPoint[];

  @ApiProperty({ 
    example: { xAxis: 'Time', yAxis: 'Users', unit: 'count' },
    description: 'Chart configuration and labels'
  })
  config: {
    xAxis: string;
    yAxis: string;
    unit: string;
    colors?: string[];
  };
}