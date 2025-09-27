import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ExecutionContext } from '@nestjs/common';
import { MockHelper, createMockAnalyticsCacheService } from '../../test/helpers/test-helpers';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;
  let cacheService: AnalyticsCacheService;

  // Mock guard that allows all requests for testing
  const mockAdminGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: MockHelper.createMockPrismaService(),
        },
        {
          provide: AnalyticsCacheService,
          useValue: createMockAnalyticsCacheService(),
        }
      ],
    })
    .overrideGuard(AdminGuard)
    .useValue(mockAdminGuard)
    .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    cacheService = module.get<AnalyticsCacheService>(AnalyticsCacheService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have analytics service defined', () => {
    expect(analyticsService).toBeDefined();
  });

  describe('Phase 3: Analytics Endpoints Excellence', () => {
    
    describe('getAnalyticsOverview', () => {
      it('should return executive analytics overview', async () => {
        const result = await controller.getAnalyticsOverview();
        
        expect(result).toHaveProperty('totalUsers');
        expect(result).toHaveProperty('systemHealth');
        expect(result).toHaveProperty('securityScore');
        expect(typeof result.totalUsers).toBe('number');
        expect(typeof result.securityScore).toBe('number');
      });
    });

    describe('getUserAnalytics', () => {
      it('should return comprehensive user analytics', async () => {
        const result = await controller.getUserAnalytics();
        
        expect(result).toHaveProperty('totalUsers');
        expect(result).toHaveProperty('usersByStatus');
        expect(result).toHaveProperty('registrationTrends');
        expect(result).toHaveProperty('deviceTypes');
      });
    });

    describe('getActivityAnalytics', () => {
      it('should return activity patterns', async () => {
        const result = await controller.getActivityAnalytics();
        
        expect(result).toHaveProperty('dailyActiveUsers');
        expect(result).toHaveProperty('peakHours');
        expect(result).toHaveProperty('topEndpoints');
      });
    });

    describe('getSecurityAnalytics', () => {
      it('should return security analytics', async () => {
        const result = await controller.getSecurityAnalytics();
        
        expect(result).toHaveProperty('securityScore');
        expect(result).toHaveProperty('securityAlerts');
        expect(result).toHaveProperty('passwordStrengthDistribution');
      });
    });

    describe('getSystemAnalytics', () => {
      it('should return system performance', async () => {
        const result = await controller.getSystemAnalytics();
        
        expect(result).toHaveProperty('systemHealth');
        expect(result).toHaveProperty('responseTime');
        expect(result).toHaveProperty('resourceUtilization');
      });
    });

    describe('getTrendAnalytics', () => {
      it('should return trend analysis', async () => {
        const result = await controller.getTrendAnalytics('daily');
        
        expect(result).toHaveProperty('period');
        expect(result).toHaveProperty('trendData');
        expect(result).toHaveProperty('periodComparison');
        expect(result.period).toBe('daily');
      });
    });

    describe('exportAnalytics', () => {
      it('should generate data export', async () => {
        const exportDto = {
          format: 'csv' as const,
          dataType: 'overview' as const,
          startDate: '2024-09-20',
          endDate: '2024-09-27'
        };

        const result = await controller.exportAnalytics(exportDto);
        
        expect(result).toHaveProperty('filename');
        expect(result).toHaveProperty('downloadUrl');
      });
    });

    describe('getChartData', () => {
      it('should return chart data', async () => {
        const result = await controller.getChartData('user-growth');
        
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('chartType');
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('config');
      });
    });

    describe('getAnalyticsStatus', () => {
      it('should return system status', async () => {
        const result = await controller.getAnalyticsStatus();
        
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('phase');
        expect(result).toHaveProperty('version');
        expect(result).toHaveProperty('endpoints');
        expect(result.status).toBe('operational');
        expect(result.endpoints).toBe(8);
      });
    });
  });
});