import 'jest-extended';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

// Global test application instance
let app: INestApplication;
let prisma: PrismaService;

// Setup before all e2e tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
});

// Cleanup after all tests
afterAll(async () => {
  if (prisma) {
    // Clean up test database
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  }
  
  if (app) {
    await app.close();
  }
});

// Utility to get test app instance
export const getTestApp = () => app;
export const setTestApp = (testApp: INestApplication) => {
  app = testApp;
};

// Utility to get Prisma service
export const getTestPrisma = () => prisma;
export const setTestPrisma = (testPrisma: PrismaService) => {
  prisma = testPrisma;
};