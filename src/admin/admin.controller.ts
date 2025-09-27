import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Query, 
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { 
  AdminStatsOverviewDto, 
  AdminUserListDto, 
  AdminUserDto,
  AdminActionResponseDto,
  AdminUserUpdateDto,
  AdminBulkActionDto,
  AdminUserExportDto 
} from './dto/admin-response.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'System overview dashboard',
    description: `
**👑 Admin Dashboard Overview**

Comprehensive system statistics and metrics for administrators.
Provides real-time insights into user activity, system health, and security status.

**✨ Includes:**
• Total user count & growth metrics
• Active user sessions
• Security alerts & failed logins
• System health status
• API usage statistics
• Performance metrics

**🔒 Admin Only:** Requires admin authentication
    `
  })
  @ApiResponse({
    status: 200,
    description: '📊 System overview statistics',
    type: AdminStatsOverviewDto,
    examples: {
      overview: {
        summary: 'Admin Dashboard Data',
        value: {
          totalUsers: 1247,
          newUsersToday: 23,
          activeSessions: 89,
          systemHealth: 'UP',
          apiCallsToday: 156789,
          failedLoginsLastHour: 3,
          lockedAccounts: 1,
          uptimePercentage: 99.8
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: '🚫 Admin access required',
    schema: {
      example: {
        statusCode: 403,
        message: 'Admin access required',
        error: 'Forbidden'
      }
    }
  })
  async getSystemOverview(): Promise<AdminStatsOverviewDto> {
    return this.adminService.getSystemOverview();
  }

  @Get('users')
  @ApiOperation({
    summary: 'List all users with pagination',
    description: `
**👥 User Management Dashboard**

Paginated list of all registered users with detailed information for administration.
Includes user status, last login, security details, and account management data.

**✨ Features:**
• Paginated user listing
• User status indicators
• Last login tracking
• Security information
• Account management details
• Admin privilege indicators

**🔍 Perfect for:**
• User account management
• Security monitoring
• User activity analysis
• Account status tracking
    `
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Users per page (default: 20, max: 100)',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: '👥 Paginated user list',
    type: AdminUserListDto,
    examples: {
      userList: {
        summary: 'User Management Data',
        value: {
          users: [
            {
              id: 'clp1234567890',
              email: 'john.doe@example.com',
              username: 'johndoe123',
              isAdmin: false,
              failedLoginAttempts: 0,
              lockedUntil: null,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T14:30:00.000Z',
              lastLogin: '2024-01-15T09:45:00.000Z',
              status: 'active'
            }
          ],
          total: 1247,
          page: 1,
          limit: 20,
          totalPages: 63
        }
      }
    }
  })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<AdminUserListDto> {
    // Ensure reasonable limits
    const safeLimit = Math.min(limit, 100);
    return this.adminService.getAllUsers(page, safeLimit);
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Get detailed user information',
    description: `
**🔍 User Detail View**

Comprehensive user account information for administrative purposes.
Includes security details, account status, and management options.

**✨ Information Includes:**
• Complete user profile
• Security status & failed attempts
• Account creation & update history
• Last login tracking
• Admin privilege status
• Account lock status
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to retrieve',
    example: 'clp1234567890'
  })
  @ApiResponse({
    status: 200,
    description: '👤 User details retrieved',
    type: AdminUserDto
  })
  @ApiResponse({
    status: 404,
    description: '❌ User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID clp1234567890 not found',
        error: 'Not Found'
      }
    }
  })
  async getUserById(@Param('id') userId: string): Promise<AdminUserDto> {
    return this.adminService.getUserById(userId);
  }

  @Post('users/:id/unlock')
  @ApiOperation({
    summary: 'Unlock locked user account',
    description: `
**🔓 Account Unlock Management**

Unlock a user account that has been locked due to security policies.
Resets failed login attempts and removes account lock restrictions.

**✨ Actions Performed:**
• Remove account lock timestamp
• Reset failed login attempts to 0
• Log admin action for audit trail
• Enable immediate user access

**🛡️ Security Note:** This action is logged for audit purposes
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to unlock',
    example: 'clp1234567890'
  })
  @ApiResponse({
    status: 200,
    description: '🔓 User account unlocked successfully',
    type: AdminActionResponseDto,
    examples: {
      unlocked: {
        summary: 'Account Unlocked',
        value: {
          success: true,
          message: 'User account unlocked successfully',
          timestamp: '2024-01-15T14:30:00.000Z',
          userId: 'clp1234567890'
        }
      }
    }
  })
  async unlockUser(@Param('id') userId: string): Promise<AdminActionResponseDto> {
    return this.adminService.unlockUser(userId);
  }

  @Patch('users/:id/admin')
  @ApiOperation({
    summary: 'Toggle user admin privileges',
    description: `
**👑 Admin Privilege Management**

Grant or revoke administrative privileges for a user account.
This action changes the user's ability to access admin-only endpoints.

**✨ Features:**
• Toggle admin status (grant/revoke)
• Immediate privilege application
• Audit logging for security
• Role-based access control

**⚠️ Important:** Use with caution - admin privileges grant full system access
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to modify admin status',
    example: 'clp1234567890'
  })
  @ApiResponse({
    status: 200,
    description: '👑 Admin privileges updated',
    type: AdminActionResponseDto,
    examples: {
      granted: {
        summary: 'Admin Privileges Granted',
        value: {
          success: true,
          message: 'Admin privileges granted successfully',
          timestamp: '2024-01-15T14:30:00.000Z',
          userId: 'clp1234567890'
        }
      },
      revoked: {
        summary: 'Admin Privileges Revoked',
        value: {
          success: true,
          message: 'Admin privileges revoked successfully',
          timestamp: '2024-01-15T14:30:00.000Z',
          userId: 'clp1234567890'
        }
      }
    }
  })
  async toggleAdminStatus(@Param('id') userId: string): Promise<AdminActionResponseDto> {
    return this.adminService.toggleAdminStatus(userId);
  }

  @Get('security/alerts')
  @ApiOperation({
    summary: 'Get security alerts and suspicious activity',
    description: `
**🛡️ Security Monitoring Center**

Monitor security-related activities and potential threats.
Provides overview of locked accounts, suspicious login attempts, and security incidents.

**✨ Monitoring Includes:**
• Locked user accounts
• High failed login attempts
• Suspicious activity patterns
• Security incident count
• Account status overview

**🚨 Use for:**
• Security incident response
• Proactive threat monitoring
• Account security management
• Suspicious activity investigation
    `
  })
  @ApiResponse({
    status: 200,
    description: '🚨 Security alerts and monitoring data',
    schema: {
      examples: {
        securityAlerts: {
          summary: 'Security Monitoring Data',
          value: {
            lockedAccounts: [
              {
                id: 'clp1234567890',
                email: 'suspicious@example.com',
                username: 'suspicious_user',
                lockedUntil: '2024-01-15T15:30:00.000Z',
                failedLoginAttempts: 5
              }
            ],
            suspiciousActivity: [
              {
                id: 'clp0987654321',
                email: 'risky@example.com',
                username: 'risky_user',
                failedLoginAttempts: 4
              }
            ],
            totalSecurityIssues: 2
          }
        }
      }
    }
  })
  async getSecurityAlerts() {
    return this.adminService.getSecurityAlerts();
  }

  // Enhanced User Management Endpoints for NextJS Frontend

  @Get('users-advanced')
  @ApiOperation({
    summary: 'Advanced user listing with filtering and sorting',
    description: `
**🔍 Enhanced User Management**

Advanced user listing with comprehensive filtering, sorting, and search capabilities.
Perfect for NextJS frontend integration with real-time updates.

**✨ Features:**
• Text search (username/email)
• Status filtering (active/locked/admin)
• Column sorting (any field)
• Pagination with metadata
• Frontend-friendly response format

**🎯 NextJS Integration Ready:**
• Optimized response structure
• Search debouncing support
• Sort state management
• Filter persistence
    `
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({
    status: 200,
    description: '📊 Advanced user listing with metadata',
    type: AdminUserListDto
  })
  async getUsersAdvanced(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') searchTerm?: string,
    @Query('status') statusFilter?: string,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy?: string,
    @Query('sortOrder', new DefaultValuePipe('desc')) sortOrder?: 'asc' | 'desc',
  ): Promise<AdminUserListDto> {
    const safeLimit = Math.min(limit, 100);
    return this.adminService.getAllUsers(page, safeLimit, searchTerm, statusFilter, sortBy, sortOrder);
  }

  @Patch('users/:id/profile')
  @ApiOperation({
    summary: 'Update user profile and settings',
    description: `
**✏️ User Profile Management**

Update user account details, security settings, and administrative privileges.
Supports partial updates and account unlock operations.

**✨ Update Options:**
• Username and email
• Password reset
• Admin status toggle
• Account unlock
• Bulk field updates
    `
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clp1234567890' })
  @ApiResponse({
    status: 200,
    description: '✅ User updated successfully',
    type: AdminUserDto
  })
  async updateUserProfile(
    @Param('id') userId: string,
    @Body() updateData: AdminUserUpdateDto
  ): Promise<AdminUserDto> {
    return this.adminService.updateUserProfile(userId, updateData);
  }

  @Post('users/bulk-action')
  @ApiOperation({
    summary: 'Perform bulk operations on multiple users',
    description: `
**⚡ Bulk User Operations**

Efficiently manage multiple user accounts with batch operations.
Perfect for administrative tasks and user management workflows.

**🔧 Supported Actions:**
• Bulk unlock accounts
• Bulk lock accounts  
• Promote to admin
• Demote from admin
• Bulk delete (use carefully!)

**💡 NextJS Frontend Benefits:**
• Progress tracking support
• Batch operation results
• Error handling per user
• Rollback capabilities
    `
  })
  @ApiResponse({
    status: 200,
    description: '✅ Bulk operation completed',
    schema: {
      example: {
        success: true,
        affected: 15,
        message: 'Successfully performed unlock action on 15 users'
      }
    }
  })
  async performBulkAction(
    @Body() bulkActionDto: AdminBulkActionDto
  ) {
    return this.adminService.performBulkAction(bulkActionDto);
  }

  @Post('users/export')
  @ApiOperation({
    summary: 'Export user data in various formats',
    description: `
**📊 User Data Export**

Export user data for reporting, analysis, or backup purposes.
Supports multiple formats and flexible field selection.

**📁 Export Formats:**
• CSV (Spreadsheet compatible)
• JSON (API/Development use)

**🎯 Customizable Fields:**
• Basic info (id, email, username)
• Security details (failed attempts, locks)
• Activity data (last login, creation date)
• Admin status and privileges

**🔄 Perfect for:**
• Regular data backups
• Compliance reporting
• User analytics
• Migration planning
    `
  })
  @ApiResponse({
    status: 200,
    description: '📥 Export data generated',
    schema: {
      example: {
        data: [
          {
            id: 'clp1234567890',
            email: 'user@example.com',
            username: 'username123',
            isAdmin: false,
            createdAt: '2024-01-15T10:30:00.000Z'
          }
        ],
        filename: 'users_export_2024-01-15.csv'
      }
    }
  })
  async exportUsers(
    @Body() exportDto: AdminUserExportDto
  ) {
    return this.adminService.exportUsers(exportDto);
  }
}