// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ 
    example: 'cuid1234567890',
    description: 'Unique user identifier (CUID)'
  })
  id: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User\'s email address'
  })
  email: string;

  @ApiProperty({ 
    example: 'johndoe123',
    description: 'User\'s username'
  })
  username: string;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg',
    description: 'User\'s avatar image URL',
    nullable: true
  })
  avatar?: string | null;

  @ApiProperty({ 
    example: false,
    description: 'Whether the user has admin privileges'
  })
  isAdmin: boolean;

  @ApiProperty({ 
    example: 0,
    description: 'Number of failed login attempts'
  })
  failedLoginAttempts: number;

  @ApiProperty({ 
    example: null,
    description: 'Account lockout expiration timestamp',
    nullable: true
  })
  lockedUntil?: Date | null;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z',
    description: 'Account creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({ 
    example: '2024-01-01T12:30:00.000Z',
    description: 'Last account update timestamp'
  })
  updatedAt: Date;

  @ApiProperty({ 
    example: '2024-01-01T12:30:00.000Z',
    description: 'Last login timestamp',
    nullable: true
  })
  lastLoginAt?: Date | null;

  @ApiProperty({ 
    example: '2024-01-01T12:30:00.000Z',
    description: 'Last activity timestamp',
    nullable: true
  })
  lastActiveAt?: Date | null;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Newly created user information',
    type: UserResponseDto
  })
  user: UserResponseDto;

  @ApiProperty({
    example: 'Account created successfully. Please login to continue.',
    description: 'Success message'
  })
  message: string;
}

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for API authentication'
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token for obtaining new access tokens'
  })
  refresh_token: string;

  @ApiProperty({
    example: 1800,
    description: 'Access token expiration time in seconds (30 minutes)'
  })
  expires_in: number;

  @ApiProperty({
    example: 'Bearer',
    description: 'Token type for Authorization header'
  })
  token_type: string;
}

export class LoginResponseDto extends TokenResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Successfully logged out',
    description: 'Logout confirmation message'
  })
  message: string;

  @ApiProperty({
    example: '2024-01-01T12:30:00.000Z',
    description: 'Logout timestamp'
  })
  timestamp: string;
}

export class RefreshResponseDto extends TokenResponseDto {
  @ApiProperty({
    example: 'Token refreshed successfully',
    description: 'Refresh confirmation message'
  })
  message: string;
}