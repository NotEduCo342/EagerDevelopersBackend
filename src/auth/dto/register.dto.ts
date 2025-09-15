// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // <-- Import this
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' }) // <-- Add this
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'testuser' }) // <-- Add this
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Password123!', description: 'Minimum 8 characters' }) // <-- Add this
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}