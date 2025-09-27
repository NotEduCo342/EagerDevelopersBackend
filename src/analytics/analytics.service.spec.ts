import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockHelper, createMockAnalyticsCacheService } from '../../test/helpers/test-helpers';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;
  let cacheService: AnalyticsCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: MockHelper.createMockPrismaService(),
        },
        {
          provide: AnalyticsCacheService,
          useValue: createMockAnalyticsCacheService(),
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<AnalyticsCacheService>(AnalyticsCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalyticsOverview', () => {
    it('should return comprehensive analytics overview', async () => {
      const result = await service.getAnalyticsOverview();
      
      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('newUsersToday');
      expect(result).toHaveProperty('activeUsers24h');
      expect(result).toHaveProperty('activeUsers7d');
      expect(result).toHaveProperty('userGrowthRate');
      expect(result).toHaveProperty('apiCallsToday');
      expect(result).toHaveProperty('averageResponseTime');
      expect(result).toHaveProperty('errorRate');
      expect(result).toHaveProperty('systemHealth');
      expect(result).toHaveProperty('securityScore');
      
      // Phase 2: Verify real database intelligence data types
      expect(typeof result.totalUsers).toBe('number');
      expect(typeof result.newUsersToday).toBe('number');
      expect(typeof result.activeUsers24h).toBe('number');
      expect(typeof result.securityScore).toBe('number');
      expect(typeof result.userGrowthRate).toBe('string');
      expect(result.userGrowthRate).toMatch(/^[+-]\d+\.\d+%$/); // Format: +12.5%
    });

    it('should return valid system health status', async () => {
      const result = await service.getAnalyticsOverview();
      
      expect(['excellent', 'good', 'warning', 'critical']).toContain(result.systemHealth);
    });

    it('should call prisma methods for real database intelligence', async () => {
      await service.getAnalyticsOverview();
      
      // Verify that our Phase 2 database methods are called
      expect(prismaService.user.count).toHaveBeenCalled();
    });
  });

  describe('getUserAnalytics', () => {
    it('should return detailed user analytics with Phase 2 intelligence', async () => {
      const result = await service.getUserAnalytics();
      
      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('newUsersToday');
      expect(result).toHaveProperty('newUsersThisWeek');
      expect(result).toHaveProperty('newUsersThisMonth');
      expect(result).toHaveProperty('usersByStatus');
      expect(result).toHaveProperty('registrationTrends');
      expect(result).toHaveProperty('deviceTypes');
      expect(result).toHaveProperty('averageSessionDuration');
      
      // Phase 2: Verify advanced data structures
      expect(Array.isArray(result.registrationTrends)).toBe(true);
      expect(typeof result.averageSessionDuration).toBe('number');
      expect(result.averageSessionDuration).toBeGreaterThan(0);
      
      // Verify device types structure
      expect(result.deviceTypes).toHaveProperty('desktop');
      expect(result.deviceTypes).toHaveProperty('mobile');
      expect(result.deviceTypes).toHaveProperty('tablet');
    });

    it('should include comprehensive user status breakdown', async () => {
      const result = await service.getUserAnalytics();
      
      expect(result.usersByStatus).toHaveProperty('active');
      expect(result.usersByStatus).toHaveProperty('locked');
      expect(result.usersByStatus).toHaveProperty('admin');
      
      // Phase 2: Verify realistic data ranges
      expect(result.usersByStatus.active).toBeGreaterThan(0);
      expect(result.usersByStatus.locked).toBeGreaterThanOrEqual(0);
      expect(result.usersByStatus.admin).toBeGreaterThan(0);
    });

    it('should call multiple prisma methods for comprehensive analytics', async () => {
      await service.getUserAnalytics();
      
      // Verify Phase 2 database intelligence calls
      expect(prismaService.user.count).toHaveBeenCalled();
    });
  });

  describe('getActivityAnalytics', () => {
    it('should return activity patterns and engagement metrics', async () => {
      const result = await service.getActivityAnalytics();
      
      expect(result).toHaveProperty('dailyActiveUsers');
      expect(result).toHaveProperty('weeklyActiveUsers');
      expect(result).toHaveProperty('peakHours');
      expect(result).toHaveProperty('topEndpoints');
      expect(Array.isArray(result.peakHours)).toBe(true);
      expect(Array.isArray(result.topEndpoints)).toBe(true);
    });
  });

  describe('getSecurityAnalytics', () => {
    it('should return security metrics and threat analysis', async () => {
      const result = await service.getSecurityAnalytics();
      
      expect(result).toHaveProperty('securityScore');
      expect(result).toHaveProperty('failedLoginAttempts24h');
      expect(result).toHaveProperty('securityAlerts');
      expect(result).toHaveProperty('passwordStrengthDistribution');
      expect(Array.isArray(result.securityAlerts)).toBe(true);
    });

    it('should return valid security score', async () => {
      const result = await service.getSecurityAnalytics();
      
      expect(result.securityScore).toBeGreaterThanOrEqual(0);
      expect(result.securityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getSystemAnalytics', () => {
    it('should return system performance metrics', async () => {
      const result = await service.getSystemAnalytics();
      
      expect(result).toHaveProperty('systemHealth');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('databasePerformance');
      expect(result).toHaveProperty('resourceUtilization');
      expect(result.responseTime).toHaveProperty('average');
      expect(result.responseTime).toHaveProperty('p95');
      expect(result.responseTime).toHaveProperty('p99');
    });
  });

  describe('getTrendAnalytics', () => {
    it('should return trend analysis for daily period', async () => {
      const result = await service.getTrendAnalytics('daily');
      
      expect(result.period).toBe('daily');
      expect(result).toHaveProperty('trendData');
      expect(result).toHaveProperty('periodComparison');
      expect(Array.isArray(result.trendData)).toBe(true);
    });

    it('should handle different time periods', async () => {
      const periods: Array<'hourly' | 'daily' | 'weekly' | 'monthly'> = ['hourly', 'daily', 'weekly', 'monthly'];
      
      for (const period of periods) {
        const result = await service.getTrendAnalytics(period);
        expect(result.period).toBe(period);
      }
    });
  });

  describe('exportAnalytics', () => {
    it('should generate export response with download information', async () => {
      const exportDto = {
        format: 'csv' as const,
        dataType: 'overview' as const,
        startDate: '2024-09-20',
        endDate: '2024-09-27'
      };

      const result = await service.exportAnalytics(exportDto);
      
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('downloadUrl');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('expiresAt');
      expect(result.filename).toContain('analytics');
      expect(result.filename).toContain('.csv');
    });
  });

  describe('getChartData', () => {
    it('should return chart-ready data structure', async () => {
      const result = await service.getChartData('user-growth');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('chartType');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('config');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include proper chart configuration', async () => {
      const result = await service.getChartData('user-growth');
      
      expect(result.config).toHaveProperty('xAxis');
      expect(result.config).toHaveProperty('yAxis');
      expect(result.config).toHaveProperty('unit');
    });
  });
});