// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User\'s registered email address',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    example: 'MySecurePass123!',
    description: 'User\'s password',
    format: 'password',
    writeOnly: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ 
    example: false, 
    description: 'Extended session duration: false = 24 hours, true = 30 days',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}