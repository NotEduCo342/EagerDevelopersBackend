import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserFactory, AuthFactory } from '../../test/helpers/test-factories';
import { MockHelper } from '../../test/helpers/test-helpers';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hash'),
  compare: jest.fn().mockResolvedValue(false),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any; // Use any type to avoid strict typing issues
  let jwtService: any;
  let configService: any;

  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: MockHelper.createMockPrismaService(),
        },
        {
          provide: JwtService,
          useValue: MockHelper.createMockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: MockHelper.createMockConfigService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Reset all mocks before each test and set default behaviors
    jest.clearAllMocks();
    
    // Reset bcrypt mocks with proper typing
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerDto = AuthFactory.buildRegisterDto();
      const hashedPassword = 'hashedPassword123';
      const userData = UserFactory.build({
        email: registerDto.email,
        password: hashedPassword,
      });

      prismaService.user.findUnique.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaService.user.create.mockResolvedValue({
        id: 1,
        ...userData,
      } as any);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
        },
      });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const registerDto = AuthFactory.buildRegisterDto();
      const existingUser = UserFactory.build({ email: registerDto.email });

      prismaService.user.findUnique.mockResolvedValue({
        id: 1,
        ...existingUser,
      } as any);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'A user with this email already exists.'
      );
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      const loginDto = AuthFactory.buildLoginDto();
      const user = UserFactory.build({
        email: loginDto.email,
        password: 'hashedPassword',
        failedLoginAttempts: 2,
        lockedUntil: null,
      });

      prismaService.user.findUnique.mockResolvedValue({
        id: 1,
        ...user,
      } as any);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue({
        id: 1,
        ...user,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as any);

      // Act
      const result = await service.validateUser(loginDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('failedLoginAttempts');
      expect(result.email).toBe(loginDto.email);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const loginDto = AuthFactory.buildLoginDto();
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(loginDto);

      // Assert
      expect(result).toBeNull();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      // Arrange
      const loginDto = AuthFactory.buildLoginDto();
      const lockoutTime = new Date(Date.now() + 60000); // 1 minute in future
      const lockedUser = UserFactory.build({
        email: loginDto.email,
        failedLoginAttempts: 10,
        lockedUntil: lockoutTime,
      });

      prismaService.user.findUnique.mockResolvedValue({
        id: 1,
        ...lockedUser,
      } as any);

      // Act & Assert
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        /Account is locked due to too many failed login attempts/
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
