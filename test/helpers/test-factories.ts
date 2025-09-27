import * as bcrypt from 'bcrypt';

// Simple faker replacement for testing
const testFaker = {
  internet: {
    email: () => `test${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: (options?: { length?: number; memorable?: boolean }) => 
      'TestPass123!' + Math.random().toString(36).substr(2, options?.length || 6),
  },
  string: {
    alphanumeric: (length: number) => Math.random().toString(36).substr(2, length),
  },
  date: {
    past: (options?: { years?: number }) => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    recent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    future: () => new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
  },
  number: {
    int: (options: { min: number; max: number }) => 
      Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
  },
};

// User type definition for testing
export interface TestUser {
  id?: number;
  email: string;
  username?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: Date | null;
  lockedUntil?: Date | null;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: Date | null;
  lastActiveAt?: Date | null;
  lastLoginAt?: Date | null;
}

/**
 * Test data factory for creating User entities
 * Provides realistic test data with proper relationships and constraints
 */
export class UserFactory {
  /**
   * Create a basic user data object (without database persistence)
   */
  static build(overrides: Partial<TestUser> = {}): Omit<TestUser, 'id'> {
    return {
      email: testFaker.internet.email().toLowerCase(),
      username: `user${Math.random().toString(36).substr(2, 6)}`,
      password: 'hashedPassword123', // Will be properly hashed in create methods
      createdAt: testFaker.date.past({ years: 1 }),
      updatedAt: testFaker.date.recent(),
      isAdmin: false,
      isLocked: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lockedUntil: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      lastActiveAt: testFaker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Create a user with hashed password (ready for database insertion)
   */
  static async buildWithHashedPassword(overrides: Partial<TestUser> = {}): Promise<Omit<TestUser, 'id'>> {
    const userData = this.build(overrides);
    
    // Hash the password if it's provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    return userData;
  }

  /**
   * Create multiple users
   */
  static buildMany(count: number, overrides: Partial<TestUser> = {}): Omit<TestUser, 'id'>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  /**
   * Create an admin user
   */
  static buildAdmin(overrides: Partial<TestUser> = {}): Omit<TestUser, 'id'> {
    return this.build({
      isAdmin: true,
      email: `admin${Math.random().toString(36).substr(2, 6)}@admin.example.com`,
      ...overrides,
    });
  }

  /**
   * Create a locked user
   */
  static buildLocked(overrides: Partial<TestUser> = {}): Omit<TestUser, 'id'> {
    return this.build({
      isLocked: true,
      failedLoginAttempts: 5,
      lockoutUntil: testFaker.date.future(),
      lockedUntil: testFaker.date.future(),
      ...overrides,
    });
  }

  /**
   * Create user with refresh token
   */
  static buildWithRefreshToken(overrides: Partial<TestUser> = {}): Omit<TestUser, 'id'> {
    return this.build({
      refreshToken: testFaker.string.alphanumeric(32),
      refreshTokenExpiresAt: testFaker.date.future(),
      ...overrides,
    });
  }
}

/**
 * Auth-related test data factory
 */
export class AuthFactory {
  /**
   * Create login credentials
   */
  static buildLoginDto(overrides: { email?: string; password?: string } = {}) {
    return {
      email: testFaker.internet.email().toLowerCase(),
      password: 'Password123!',
      ...overrides,
    };
  }

  /**
   * Create register data
   */
  static buildRegisterDto(overrides: { email?: string; password?: string; username?: string } = {}) {
    return {
      email: testFaker.internet.email().toLowerCase(),
      password: 'Password123!',
      username: `user${Math.random().toString(36).substr(2, 6)}`,
      ...overrides,
    };
  }

  /**
   * Create JWT payload
   */
  static buildJwtPayload(overrides: { userId?: number; email?: string; isAdmin?: boolean } = {}) {
    return {
      sub: overrides.userId || testFaker.number.int({ min: 1, max: 1000 }),
      email: overrides.email || testFaker.internet.email().toLowerCase(),
      isAdmin: overrides.isAdmin || false,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      ...overrides,
    };
  }
}

/**
 * Database test utilities
 */
export class TestDataCleaner {
  /**
   * Clean all test data from database
   */
  static async cleanDatabase(prisma: any) {
    // Delete in order to respect foreign key constraints
    await prisma.user.deleteMany({});
    // Add other model cleanups here as they're created
  }

  /**
   * Reset database to clean state
   */
  static async resetDatabase(prisma: any) {
    await this.cleanDatabase(prisma);
    // Add any seed data here if needed
  }
}

/**
 * Common test assertions and utilities
 */
export class TestHelpers {
  /**
   * Assert user object structure
   */
  static expectUserStructure(user: any) {
    expect(user).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      isAdmin: expect.any(Boolean),
      isLocked: expect.any(Boolean),
      failedLoginAttempts: expect.any(Number),
    });
    
    // Password should not be included in returned user objects
    expect(user).not.toHaveProperty('password');
  }

  /**
   * Assert JWT token structure
   */
  static expectJwtTokenStructure(tokenResponse: any) {
    expect(tokenResponse).toMatchObject({
      access_token: expect.any(String),
      token_type: 'Bearer',
      expires_in: expect.any(Number),
    });
  }

  /**
   * Create authenticated request headers
   */
  static createAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Wait for a specified amount of time (useful for testing time-sensitive features)
   */
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a random email for testing
   */
  static randomEmail(): string {
    return testFaker.internet.email().toLowerCase();
  }

  /**
   * Generate a secure password for testing
   */
  static securePassword(): string {
    return testFaker.internet.password({ length: 12, memorable: true }) + '1!';
  }
}