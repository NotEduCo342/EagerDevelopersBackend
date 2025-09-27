// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Get,
  Request,
  Req,
  Res,
  BadRequestException,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiSecurity,
  ApiHeader,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { AuthService, TokenPair } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { 
  RegisterResponseDto, 
  LoginResponseDto, 
  LogoutResponseDto, 
  RefreshResponseDto,
  TokenResponseDto 
} from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { SwaggerResponses } from '../config/swagger.config';
import { 
  LoginThrottle, 
  RefreshThrottle, 
  RegisterThrottle, 
  SessionThrottle, 
  LogoutThrottle 
} from './decorators/auth-throttle.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterThrottle()
  @Post('register')
  @ApiOperation({
    summary: 'Create new user account',
    description: `
**👤 User Registration Endpoint**

Create a secure user account with email verification and password requirements.
All passwords are hashed with bcrypt for maximum security.

**✨ Features:**
• Unique email validation
• Strong password requirements  
• Rate limiting protection
• Secure password hashing
• Instant user creation

**🔐 Password Requirements:**
• Minimum 8 characters
• 1 uppercase letter
• 1 lowercase letter  
• 1 number
• 1 special character
    `
  })
  @ApiBody({ 
    type: RegisterDto,
    examples: {
      developer: {
        summary: 'Developer Account',
        description: 'Example registration for a developer',
        value: {
          email: 'alice.developer@eagerdevelopers.com',
          username: 'alice_dev',
          password: 'DevSecure123!'
        }
      },
      manager: {
        summary: 'Project Manager Account', 
        description: 'Example registration for a project manager',
        value: {
          email: 'bob.manager@eagerdevelopers.com',
          username: 'bob_pm',
          password: 'ProjectLead456!'
        }
      },
      designer: {
        summary: 'UI/UX Designer Account',
        description: 'Example registration for a designer',
        value: {
          email: 'carol.designer@eagerdevelopers.com', 
          username: 'carol_ux',
          password: 'DesignFlow789!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '🎉 Account created successfully',
    schema: {
      example: {
        user: {
          id: 'clp9876543210',
          email: 'alice.developer@eagerdevelopers.com',
          username: 'alice_dev',
          isAdmin: false,
          avatar: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
          createdAt: '2024-01-15T14:30:00.000Z',
          updatedAt: '2024-01-15T14:30:00.000Z'
        },
        message: 'Account created successfully. Please login to continue.'
      }
    }
  })
  @ApiResponse(SwaggerResponses.BadRequest)
  @ApiResponse(SwaggerResponses.Conflict)
  @ApiResponse(SwaggerResponses.TooManyRequests)
  @ApiResponse(SwaggerResponses.InternalServerError)
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.authService.register(registerDto);
    return {
      user,
      message: 'Account created successfully. Please login to continue.'
    };
  }

  @LoginThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and get access tokens',
    description: `
**🔐 User Authentication Endpoint**

Authenticate with email/password and receive JWT tokens for API access.
Includes device tracking and session management for enhanced security.

**✨ Features:**
• JWT access & refresh tokens
• Device fingerprinting
• Session tracking
• Account lockout protection
• Rate limiting (5 req/min)

**🚀 Try it out with demo credentials:**
• Email: demo@eagerdevelopers.com
• Password: DemoPass123!
    `
  })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      demoUser: {
        summary: 'Demo User Login',
        description: 'Use these credentials to test the API',
        value: {
          email: 'demo@eagerdevelopers.com',
          password: 'DemoPass123!',
          rememberMe: false
        }
      },
      regularUser: {
        summary: 'Regular User Login',
        description: 'Standard login without remember me',
        value: {
          email: 'john.doe@example.com',
          password: 'MySecurePass123!',
          rememberMe: false
        }
      },
      rememberMeUser: {
        summary: 'Login with Remember Me',
        description: 'Login with extended session (30 days)',
        value: {
          email: 'jane.smith@example.com',
          password: 'SecurePassword456!',
          rememberMe: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '🎉 Login successful - tokens returned',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 'clp1234567890',
          email: 'john.doe@example.com',
          username: 'johndoe123',
          isAdmin: false,
          createdAt: '2024-01-15T10:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '❌ Authentication failed',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/login'
      }
    }
  })
  @ApiResponse({
    status: 423,
    description: '🔒 Account locked due to failed attempts',
    schema: {
      example: {
        statusCode: 423,
        message: 'Account is locked due to too many failed login attempts. Try again in 15 minutes.',
        error: 'Locked',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/login',
        lockedUntil: '2024-01-15T10:45:00.000Z'
      }
    }
  })
  @ApiResponse(SwaggerResponses.TooManyRequests)
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest): Promise<TokenPair> {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract device info for session tracking
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    // Use remember me flag from DTO (default to false)
    const rememberMe = loginDto.rememberMe || false;

    return this.authService.login(user, rememberMe, deviceInfo);
  }

  // 👇 --- NEW: TOKEN REFRESH ENDPOINT --- 👇
  @RefreshThrottle()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    try {
      // Try to get refresh token from Authorization header first
      let refreshToken = '';
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      } else if (req.cookies?.refreshToken) {
        // Fallback to cookie (for future HTTP-only cookie implementation)
        refreshToken = req.cookies.refreshToken;
      } else {
        throw new BadRequestException('Refresh token not provided');
      }

      // Extract device info for session tracking
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
      };

      // Refresh tokens
      const tokenPair = await this.authService.refreshTokens(refreshToken, deviceInfo);

      // Return new tokens
      res.status(HttpStatus.OK).json(tokenPair);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to refresh tokens');
    }
  }

  // 👇 --- NEW: LOGOUT ENDPOINT --- 👇
  @LogoutThrottle()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto, @Req() req: ExpressRequest): Promise<{ message: string }> {
    try {
      // Try to get refresh token from Authorization header first
      let refreshToken = '';
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      } else if (req.cookies?.refreshToken) {
        // Fallback to cookie (for future HTTP-only cookie implementation)
        refreshToken = req.cookies.refreshToken;
      } else {
        // If no refresh token provided, still return success
        // This prevents issues with partially logged out users
        return { message: 'Logout successful' };
      }

      // Use allDevices flag from DTO (default to false)
      const allDevices = logoutDto.allDevices || false;

      await this.authService.logout(refreshToken, allDevices);

      const message = allDevices 
        ? 'Successfully logged out from all devices'
        : 'Successfully logged out';

      return { message };
    } catch (error) {
      // Even if logout fails, we return success to prevent client-side issues
      // The user should be considered logged out from their perspective
      return { message: 'Logout successful' };
    }
  }

  // 👇 --- NEW: SESSION MANAGEMENT ENDPOINTS --- 👇
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @SessionThrottle()
  @Get('sessions')
  async getUserSessions(@Request() req) {
    const userId = req.user.id;
    const sessions = await this.authService.getUserSessions(userId);
    
    return {
      sessions,
      total: sessions.length,
      message: `Found ${sessions.length} active session${sessions.length !== 1 ? 's' : ''}`,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @SessionThrottle()
  @Delete('sessions/:tokenId')
  async revokeSession(@Request() req, @Param('tokenId') tokenId: string): Promise<{ message: string }> {
    const userId = req.user.id;
    
    try {
      await this.authService.revokeSession(userId, tokenId);
      return { message: 'Session revoked successfully' };
    } catch (error) {
      throw new NotFoundException('Session not found or already revoked');
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @SessionThrottle()
  @Delete('sessions')
  async revokeAllOtherSessions(@Request() req): Promise<{ message: string; revokedCount: number }> {
    const userId = req.user.id;
    
    try {
      // Get all sessions before revoking
      const allSessions = await this.authService.getUserSessions(userId);
      
      // For simplicity, we'll revoke all sessions and let the user re-login
      // In a production app, you might want to preserve the current session
      let revokedCount = 0;
      for (const session of allSessions) {
        await this.authService.revokeSession(userId, session.id);
        revokedCount++;
      }

      return { 
        message: `Successfully ended ${revokedCount} session${revokedCount !== 1 ? 's' : ''} (including current session)`,
        revokedCount,
      };
    } catch (error) {
      throw new BadRequestException('Failed to revoke sessions');
    }
  }

  // 👇 --- NEW PROTECTED ROUTE --- 👇
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // Because of JwtAuthGuard, the `req.user` object is populated
    // with the user data returned from JwtStrategy's validate() method.
    return req.user;
  }

  // 👇 --- ADMIN ONLY: ACCOUNT LOCKOUT STATUS CHECK --- 👇
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('check-lockout')
  async checkLockoutStatus(@Body() body: { email: string }) {
    return this.authService.isAccountLocked(body.email);
  }
}