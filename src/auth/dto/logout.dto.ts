// src/auth/dto/logout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ 
    example: false, 
    description: 'Logout from all devices/sessions',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}