import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MockHelper } from '../../test/helpers/test-helpers';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateUser: jest.fn(),
            logout: jest.fn(),
            getUserSessions: jest.fn(),
            deleteSession: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have authService injected', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return success response', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const serviceResult = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      };
      const expectedResult = {
        user: serviceResult,
        message: 'Account created successfully. Please login to continue.'
      };

      authService.register.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors gracefully', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const error = new Error('Registration failed');

      authService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(registerDto))
        .rejects.toThrow('Registration failed');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should validate user and call authService.login with correct parameters', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };
      const mockRequest = { 
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-browser' },
        connection: { remoteAddress: '127.0.0.1' }
      };
      const validatedUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      const expectedResult = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
      const expectedDeviceInfo = {
        userAgent: 'test-browser',
        ipAddress: '127.0.0.1'
      };

      authService.validateUser.mockResolvedValue(validatedUser);
      authService.login.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(loginDto, mockRequest as any);

      // Assert
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledWith(validatedUser, false, expectedDeviceInfo);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException when user validation fails', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const mockRequest = { 
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-browser' },
        connection: { remoteAddress: '127.0.0.1' }
      };

      authService.validateUser.mockResolvedValue(null); // User validation fails

      // Act & Assert
      await expect(controller.login(loginDto, mockRequest as any))
        .rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle rememberMe flag correctly', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };
      const mockRequest = { 
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-browser' },
        connection: { remoteAddress: '127.0.0.1' }
      };
      const validatedUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      const expectedDeviceInfo = {
        userAgent: 'test-browser',
        ipAddress: '127.0.0.1'
      };

      authService.validateUser.mockResolvedValue(validatedUser);
      authService.login.mockResolvedValue({});

      // Act
      await controller.login(loginDto, mockRequest as any);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(validatedUser, true, expectedDeviceInfo);
    });
  });
});
