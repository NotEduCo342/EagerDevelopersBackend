// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Inject JwtService
  ) {}

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

  // New method to handle login and generate JWT
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
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