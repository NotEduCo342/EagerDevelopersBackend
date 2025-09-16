// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Interfaces for token payloads
interface AccessTokenPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat: number;
  exp: number;
  type: 'refresh';
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Token expiration constants
  private readonly ACCESS_TOKEN_EXPIRES_IN = 30 * 60; // 30 minutes in seconds
  private readonly REFRESH_TOKEN_EXPIRES_SHORT = 24 * 60 * 60; // 24 hours for remember me = false
  private readonly REFRESH_TOKEN_EXPIRES_LONG = 30 * 24 * 60 * 60; // 30 days for remember me = true

  // The register method remains the same
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  // Enhanced method to validate user credentials with lockout protection
  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // If user doesn't exist, return null (don't reveal this info)
    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account is locked due to too many failed login attempts. Try again after ${user.lockedUntil.toISOString()}`
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (isPasswordValid) {
      // Password is correct - reset failed attempts and unlock account
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      const { password, failedLoginAttempts, lockedUntil, ...result } = user;
      return result;
    } else {
      // Password is incorrect - increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= 10;
      
      // Lock account for 24 hours if 10 or more failed attempts
      const lockUntil = shouldLock 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        : user.lockedUntil;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: lockUntil,
        },
      });

      if (shouldLock) {
        throw new UnauthorizedException(
          'Account has been locked for 24 hours due to too many failed login attempts.'
        );
      }

      return null;
    }
  }

  // New method to handle login and generate JWT tokens
  async login(user: any, rememberMe: boolean = false, deviceInfo?: DeviceInfo): Promise<TokenPair> {
    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    return this.generateTokenPair(user, rememberMe, deviceInfo);
  }

  // Generate access token and refresh token pair
  private async generateTokenPair(user: any, rememberMe: boolean = false, deviceInfo?: DeviceInfo): Promise<TokenPair> {
    const now = Date.now();
    const accessTokenExpiresIn = this.ACCESS_TOKEN_EXPIRES_IN;
    const refreshTokenExpiresIn = rememberMe ? this.REFRESH_TOKEN_EXPIRES_LONG : this.REFRESH_TOKEN_EXPIRES_SHORT;

    // Create access token payload
    const accessTokenPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false, // Ensure this is always a boolean
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + accessTokenExpiresIn,
      type: 'access',
    };

    // Generate access token - don't pass expiresIn since we set exp manually
    const accessToken = this.jwtService.sign(accessTokenPayload);

    // Create refresh token in database
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        token: this.generateSecureToken(),
        userId: user.id,
        expiresAt: new Date(now + refreshTokenExpiresIn * 1000),
        deviceInfo: this.formatDeviceInfo(deviceInfo),
        ipAddress: deviceInfo?.ipAddress,
      },
    });

    // Create refresh token payload
    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenId: refreshTokenRecord.id,
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + refreshTokenExpiresIn,
      type: 'refresh',
    };

    // Generate refresh token JWT - don't pass expiresIn since we set exp manually
    const refreshToken = this.jwtService.sign(refreshTokenPayload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiresIn,
      token_type: 'Bearer',
    };
  }

  // Refresh access token using refresh token
  async refreshTokens(refreshToken: string, deviceInfo?: DeviceInfo): Promise<TokenPair> {
    try {
      // Verify refresh token JWT
      const payload = this.jwtService.verify(refreshToken) as RefreshTokenPayload;
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find refresh token in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Check if token is revoked or expired
      if (tokenRecord.isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (tokenRecord.expiresAt < new Date()) {
        // Clean up expired token
        await this.prisma.refreshToken.delete({
          where: { id: tokenRecord.id },
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Update last used time and user activity
      await Promise.all([
        this.prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { lastUsedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: tokenRecord.userId },
          data: { lastActiveAt: new Date() },
        }),
      ]);

      // TOKEN ROTATION: Revoke old refresh token and generate new pair
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'token_rotation',
        },
      });

      // Determine if this was a "remember me" session based on original expiry
      const originalDuration = tokenRecord.expiresAt.getTime() - tokenRecord.createdAt.getTime();
      const isRememberMe = originalDuration > 2 * 24 * 60 * 60 * 1000; // More than 2 days = remember me

      // Generate new token pair
      return this.generateTokenPair(tokenRecord.user, isRememberMe, deviceInfo);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Logout and revoke refresh tokens
  async logout(refreshToken: string, allDevices: boolean = false): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken) as RefreshTokenPayload;

      if (allDevices) {
        // Revoke all refresh tokens for the user
        await this.prisma.refreshToken.updateMany({
          where: { 
            userId: payload.sub,
            isRevoked: false,
          },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'logout_all_devices',
          },
        });
      } else {
        // Revoke only this specific refresh token
        await this.prisma.refreshToken.update({
          where: { id: payload.tokenId },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'logout',
          },
        });
      }
    } catch (error) {
      // Even if token is invalid, we consider logout successful
      // This prevents issues with already expired/invalid tokens
    }
  }

  // Get active sessions for a user
  async getUserSessions(userId: string): Promise<any[]> {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      device: session.deviceInfo || 'Unknown Device',
      ip: session.ipAddress || 'Unknown IP',
      lastUsed: session.lastUsedAt,
      created: session.createdAt,
      expires: session.expiresAt,
    }));
  }

  // Revoke specific session
  async revokeSession(userId: string, tokenId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id: tokenId,
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'manual_revocation',
      },
    });
  }

  // Helper method to generate secure random token
  private generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Helper method to format device information
  private formatDeviceInfo(deviceInfo?: DeviceInfo): string {
    if (!deviceInfo?.userAgent) return 'Unknown Device';
    
    const ua = deviceInfo.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Simple browser detection
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Simple OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('iPhone')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';

    return `${browser} on ${os}`;
  }

  // Cleanup expired refresh tokens (should be called periodically)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, revokedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Revoked tokens older than 7 days
        ],
      },
    });

    return result.count;
  }

  // Method to check if account is locked
  async isAccountLocked(email: string): Promise<{ isLocked: boolean; lockedUntil?: Date; failedAttempts: number }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { 
        failedLoginAttempts: true, 
        lockedUntil: true 
      },
    });

    if (!user) {
      return { isLocked: false, failedAttempts: 0 };
    }

    const isLocked = user.lockedUntil && user.lockedUntil > new Date();
    return {
      isLocked: !!isLocked,
      lockedUntil: user.lockedUntil || undefined,
      failedAttempts: user.failedLoginAttempts,
    };
  }

  // Method to manually unlock account (for admin use)
  async unlockAccount(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
}