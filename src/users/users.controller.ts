// src/users/users.controller.ts
import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') // <-- Groups endpoints in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth() // <-- Tells Swagger this needs a token
  @UseGuards(JwtAuthGuard)
  @Patch('me') // Endpoint will be PATCH /users/me
  updateMyProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // req.user is populated by the JwtAuthGuard
    const userId = req.user.id;
    return this.usersService.updateUser(userId, updateUserDto);
  }
}