// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // <-- Import this
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' }) // <-- Add this
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'testuser' }) // <-- Add this
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'Must contain: 8+ chars, uppercase, lowercase, number, special char' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;
}