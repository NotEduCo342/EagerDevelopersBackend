// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // <-- Import this
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' }) // <-- Add this
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' }) // <-- Add this
  @IsString()
  @IsNotEmpty()
  password: string;
}