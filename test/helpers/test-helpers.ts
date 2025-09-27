import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppModule } from '../../src/app.module';
import request from 'supertest';
import { TestDataCleaner } from './test-factories';

/**
 * Test module builder for creating isolated test modules
 */
export class TestModuleBuilder {
  /**
   * Create a test module with common providers and mocks
   */
  static async createTestingModule(
    moduleImports: any[] = [],
    providers: any[] = [],
    controllers: any[] = []
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: moduleImports,
      controllers,
      providers: [
        ...providers,
        // Add common mocked services if needed
      ],
    }).compile();
  }

  /**
   * Create a full application for e2e testing
   */
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    // Apply same pipes and middleware as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
    return app;
  }
}

/**
 * Authentication helpers for testing
 */
export class AuthTestHelper {
  /**
   * Create a JWT token for testing
   */
  static createTestToken(
    jwtService: JwtService,
    payload: { userId: number; email: string; isAdmin?: boolean }
  ): string {
    return jwtService.sign({
      sub: payload.userId,
      email: payload.email,
      isAdmin: payload.isAdmin || false,
    });
  }

  /**
   * Login and get authentication token
   */
  static async loginAndGetToken(
    app: INestApplication,
    credentials: { email: string; password: string }
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);

    return response.body.access_token;
  }

  /**
   * Create a user and return auth token
   */
  static async createUserAndGetToken(
    app: INestApplication,
    userData: { email: string; password: string }
  ): Promise<{ user: any; token: string }> {
    // Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201);

    // Login to get token
    const token = await this.loginAndGetToken(app, userData);

    return {
      user: registerResponse.body.user,
      token,
    };
  }
}

/**
 * Database helpers for testing
 */
export class DatabaseTestHelper {
  /**
   * Setup test database
   */
  static async setupTestDatabase(prisma: PrismaService): Promise<void> {
    // Ensure database is clean before tests
    await TestDataCleaner.cleanDatabase(prisma);
  }

  /**
   * Cleanup test database
   */
  static async cleanupTestDatabase(prisma: PrismaService): Promise<void> {
    await TestDataCleaner.cleanDatabase(prisma);
  }

  /**
   * Create a user in the database for testing
   */
  static async createTestUser(
    prisma: PrismaService,
    userData: {
      email: string;
      password: string;
      isAdmin?: boolean;
      isLocked?: boolean;
    }
  ) {
    return prisma.user.create({
      data: {
        email: userData.email,
        username: userData.email.split('@')[0], // Generate username from email
        password: userData.password, // Should be hashed before calling this
        isAdmin: userData.isAdmin || false,
        // isLocked: userData.isLocked || false, // This is a computed field, not a database field
        failedLoginAttempts: 0,
      },
    });
  }
}

/**
 * Mock helpers for unit testing
 */
export class MockHelper {
  /**
   * Create a mock PrismaService with properly typed Jest mocks
   * Enhanced for Phase 2 Analytics Database Intelligence Support
   */
  static createMockPrismaService() {
    return {
      user: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        // 🚀 Phase 2: Analytics Database Intelligence Support
        count: jest.fn().mockImplementation((options = {}) => {
          const { where } = options;
          // Intelligent mock responses based on query conditions
          if (where?.lockedUntil?.gt) return Promise.resolve(5); // Locked users
          if (where?.createdAt?.gte) return Promise.resolve(23); // New users in timeframe
          if (where?.isAdmin === true) return Promise.resolve(15); // Admin users
          return Promise.resolve(1247); // Total users default
        }),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockImplementation((options = {}) => {
          const { where, select, take } = options;
          // Mock recent tokens for session analytics
          const mockTokens = Array.from({ length: Math.min(take || 10, 50) }, (_, i) => ({
            createdAt: new Date(Date.now() - i * 60 * 60 * 1000), // Hours ago
            lastUsedAt: new Date(Date.now() - i * 30 * 60 * 1000), // 30 mins after creation
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            isRevoked: false
          }));
          return Promise.resolve(mockTokens);
        }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        // 🚀 Phase 2: Refresh Token Analytics Intelligence
        count: jest.fn().mockImplementation((options = {}) => {
          const { where } = options;
          // Intelligent mock responses for token analytics
          if (where?.isRevoked === false && where?.expiresAt?.gt) return Promise.resolve(892); // Active tokens
          if (where?.lastUsedAt?.gte) return Promise.resolve(342); // Recently used tokens
          if (where?.isRevoked === false) return Promise.resolve(1180); // Non-revoked tokens
          return Promise.resolve(1500); // Total tokens default
        }),
      },
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as any; // Type assertion to avoid strict typing issues
  }

  /**
   * Create a mock JwtService with properly typed Jest mocks
   */
  static createMockJwtService() {
    return {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: '1', email: 'test@test.com' }),
      decode: jest.fn().mockReturnValue({ sub: '1', email: 'test@test.com' }),
    } as any; // Type assertion to avoid strict typing issues
  }

  /**
   * Create a mock ConfigService
   */
  static createMockConfigService() {
    return {
      get: jest.fn((key: string) => {
        const config = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRES_IN: '1h',
          DATABASE_URL: 'test-database-url',
        };
        return config[key];
      }),
    };
  }
}

/**
 * Common test patterns and expectations
 */
export class CommonTestPatterns {
  /**
   * Test unauthorized access
   */
  static async testUnauthorizedAccess(
    app: INestApplication,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string
  ) {
    const response = await request(app.getHttpServer())[method](endpoint);
    expect(response.status).toBe(401);
  }

  /**
   * Test forbidden access (authenticated but insufficient permissions)
   */
  static async testForbiddenAccess(
    app: INestApplication,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    token: string
  ) {
    const response = await request(app.getHttpServer())
      [method](endpoint)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(403);
  }

  /**
   * Test validation errors
   */
  static async testValidationError(
    app: INestApplication,
    method: 'post' | 'put',
    endpoint: string,
    invalidData: any,
    token?: string
  ) {
    const requestBuilder = request(app.getHttpServer())[method](endpoint);
    
    if (token) {
      requestBuilder.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await requestBuilder.send(invalidData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  }
}

/**
 * Mock AnalyticsCacheService for testing
 * Phase 5.1: Caching integration testing support
 */
export const createMockAnalyticsCacheService = () => ({
  get: jest.fn().mockResolvedValue(null), // Always return null to test fresh data
  set: jest.fn().mockResolvedValue(undefined),
  invalidate: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
  clearAll: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue({
    totalKeys: 0,
    memoryUsage: 'Test Mode',
    hitRate: 0
  }),
  warmCache: jest.fn().mockResolvedValue(undefined)
});