// src/users/users.controller.ts
import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiResponse 
} from '@nestjs/swagger';

@ApiTags('Users') // <-- Groups endpoints in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({
    summary: 'Update user profile',
    description: `
**👤 Update Your Profile Information**

Update your account details like username or other profile information.
Authentication required via JWT Bearer token.

**✨ Features:**
• Update username
• Secure authentication required
• Real-time profile updates
• Data validation
• Password excluded from response
    `
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateUsername: {
        summary: 'Update Username',
        description: 'Change your display username',
        value: {
          username: 'new_awesome_username'
        }
      },
      updateProfile: {
        summary: 'Update Multiple Fields',
        description: 'Update various profile fields at once',
        value: {
          username: 'senior_developer_2024',
          bio: 'Full-stack developer with 5+ years experience'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '✅ Profile updated successfully',
    schema: {
      example: {
        id: 'clp1234567890',
        email: 'john.doe@example.com',
        username: 'new_awesome_username',
        isAdmin: false,
        avatar: null,
        createdAt: '2024-01-10T09:00:00.000Z',
        updatedAt: '2024-01-15T14:45:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '🔒 Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '❌ Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['username must be longer than 3 characters'],
        error: 'Bad Request'
      }
    }
  })
  updateMyProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // req.user is populated by the JwtAuthGuard
    const userId = req.user.id;
    return this.usersService.updateUser(userId, updateUserDto);
  }
}