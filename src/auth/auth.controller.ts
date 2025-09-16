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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // <-- Import the guard
import { AdminGuard } from './admin.guard'; // <-- Import the admin guard
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
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