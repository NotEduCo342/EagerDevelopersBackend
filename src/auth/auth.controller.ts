// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards, // <-- Import this
  Get,       // <-- Import this
  Request,   // <-- Import this
  Req,       // <-- Import this for request object
  Res,       // <-- Import this for response object
  BadRequestException,
  Delete,    // <-- Import this
  Param,     // <-- Import this
  NotFoundException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService, TokenPair } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // <-- Import the guard
import { AdminGuard } from './admin.guard'; // <-- Import the admin guard
import { ApiBearerAuth } from '@nestjs/swagger';
import { 
  LoginThrottle, 
  RefreshThrottle, 
  RegisterThrottle, 
  SessionThrottle, 
  LogoutThrottle 
} from './decorators/auth-throttle.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterThrottle()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @LoginThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
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