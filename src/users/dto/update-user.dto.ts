// src/users/dto/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Mahan The Dev' })
  @IsOptional()
  @IsString()
  username?: string;

  // We will handle avatar/profile picture separately
}