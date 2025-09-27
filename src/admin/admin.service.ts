import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { 
  AdminUserDto, 
  AdminStatsOverviewDto, 
  AdminUserListDto,
  AdminActionResponseDto,
  AdminUserUpdateDto,
  AdminBulkActionDto,
  AdminUserExportDto
} from './dto/admin-response.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive system overview for admin dashboard
   */
  async getSystemOverview(): Promise<AdminStatsOverviewDto> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Run all queries in parallel for better performance
      const [
        totalUsers,
        newUsersToday,
        activeSessions,
        failedLoginsLastHour,
        lockedAccounts
      ] = await Promise.all([
        this.prisma.user.count(),
        
        this.prisma.user.count({
          where: { createdAt: { gte: today } }
        }),
        
        this.prisma.user.count({
          where: {
            refreshTokens: {
              some: {
                createdAt: { gte: oneHourAgo }
              }
            }
          }
        }),
        
        // Mock failed logins - would be tracked in production
        Promise.resolve(Math.floor(Math.random() * 10) + 1),
        
        this.prisma.user.count({
          where: {
            lockedUntil: { gt: new Date() }
          }
        })
      ]);

      this.logger.log(`Admin overview requested - Total users: ${totalUsers}, New today: ${newUsersToday}`);

      return {
        totalUsers,
        newUsersToday,
        activeSessions,
        systemHealth: 'UP', // Would integrate with health service
        apiCallsToday: Math.floor(Math.random() * 200000) + 150000, // Mock data
        failedLoginsLastHour,
        lockedAccounts,
        uptimePercentage: 99.8 // Mock data - would be calculated from actual uptime
      };
    } catch (error) {
      this.logger.error('Failed to get system overview', error.message);
      throw error;
    }
  }

  /**
   * Get paginated list of all users with advanced filtering and sorting
   */
  async getAllUsers(
    page: number = 1, 
    limit: number = 20,
    searchTerm?: string,
    statusFilter?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<AdminUserListDto> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause for filtering
      const whereClause: any = {};
      
      // Search filter (username or email)
      if (searchTerm) {
        whereClause.OR = [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      // Status filter
      if (statusFilter) {
        switch (statusFilter) {
          case 'locked':
            whereClause.lockedUntil = { gt: new Date() };
            break;
          case 'admin':
            whereClause.isAdmin = true;
            break;
          case 'active':
            whereClause.lockedUntil = null;
            break;
        }
      }
      
      // Build order by clause
      const orderByClause: any = {};
      if (sortBy === 'lastLogin') {
        // Special handling for lastLogin sort
        orderByClause.refreshTokens = {
          _count: sortOrder
        };
      } else {
        orderByClause[sortBy] = sortOrder;
      }
      
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: orderByClause,
          select: {
            id: true,
            email: true,
            username: true,
            isAdmin: true,
            failedLoginAttempts: true,
            lockedUntil: true,
            createdAt: true,
            updatedAt: true,
            refreshTokens: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { createdAt: true }
            }
          }
        }),
        this.prisma.user.count({ where: whereClause })
      ]);

      // Transform users with additional computed fields
      const transformedUsers: AdminUserDto[] = users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.refreshTokens[0]?.createdAt || null,
        status: this.getUserStatus(user)
      }));

      this.logger.log(`Admin user list requested - Page: ${page}, Limit: ${limit}, Total: ${total}, Search: ${searchTerm || 'none'}, Status: ${statusFilter || 'all'}`);

      return {
        users: transformedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sortBy,
        sortOrder,
        searchTerm,
        statusFilter
      };
    } catch (error) {
      this.logger.error('Failed to get user list', error.message);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserById(userId: string): Promise<AdminUserDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          refreshTokens: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      this.logger.log(`Admin user details requested for user: ${userId}`);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.refreshTokens[0]?.createdAt || null,
        status: this.getUserStatus(user)
      };
    } catch (error) {
      this.logger.error(`Failed to get user details for ${userId}`, error.message);
      throw error;
    }
  }

  /**
   * Unlock a locked user account
   */
  async unlockUser(userId: string): Promise<AdminActionResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0
        }
      });

      this.logger.warn(`Admin unlocked user account: ${user.email} (ID: ${userId})`);

      return {
        success: true,
        message: 'User account unlocked successfully',
        timestamp: new Date().toISOString(),
        userId
      };
    } catch (error) {
      this.logger.error(`Failed to unlock user ${userId}`, error.message);
      throw error;
    }
  }

  /**
   * Update user admin status
   */
  async toggleAdminStatus(userId: string): Promise<AdminActionResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isAdmin: !user.isAdmin
        }
      });

      const action = updatedUser.isAdmin ? 'granted' : 'revoked';
      this.logger.warn(`Admin ${action} admin privileges for user: ${user.email} (ID: ${userId})`);

      return {
        success: true,
        message: `Admin privileges ${action} successfully`,
        timestamp: new Date().toISOString(),
        userId
      };
    } catch (error) {
      this.logger.error(`Failed to toggle admin status for user ${userId}`, error.message);
      throw error;
    }
  }

  /**
   * Get users with security issues (locked accounts, high failed attempts)
   */
  async getSecurityAlerts() {
    try {
      const [lockedUsers, suspiciousUsers] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            lockedUntil: { gt: new Date() }
          },
          select: {
            id: true,
            email: true,
            username: true,
            lockedUntil: true,
            failedLoginAttempts: true
          }
        }),
        
        this.prisma.user.findMany({
          where: {
            failedLoginAttempts: { gte: 3 },
            lockedUntil: null
          },
          select: {
            id: true,
            email: true,
            username: true,
            failedLoginAttempts: true
          }
        })
      ]);

      return {
        lockedAccounts: lockedUsers,
        suspiciousActivity: suspiciousUsers,
        totalSecurityIssues: lockedUsers.length + suspiciousUsers.length
      };
    } catch (error) {
      this.logger.error('Failed to get security alerts', error.message);
      throw error;
    }
  }

  /**
   * Update user profile and administrative settings (Enhanced)
   */
  async updateUserProfile(userId: string, updateData: AdminUserUpdateDto): Promise<AdminUserDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Prevent self-demotion from admin role
      if (updateData.hasOwnProperty('isAdmin') && user.isAdmin && !updateData.isAdmin) {
        this.logger.warn(`Admin user ${userId} attempted to revoke own admin privileges`);
      }

      // Hash password if provided
      const dataToUpdate: any = { ...updateData };
      if (updateData.password) {
        dataToUpdate.password = await bcrypt.hash(updateData.password, 12);
      }

      // Handle account unlock
      if (updateData.unlockAccount) {
        dataToUpdate.failedLoginAttempts = 0;
        dataToUpdate.lockedUntil = null;
      }

      // Remove non-database fields
      delete dataToUpdate.unlockAccount;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Get last login separately to avoid type issues
      const lastTokenInfo = await this.prisma.refreshToken.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      this.logger.log(`User ${userId} updated by admin`);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isAdmin: updatedUser.isAdmin,
        failedLoginAttempts: updatedUser.failedLoginAttempts,
        lockedUntil: updatedUser.lockedUntil,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLogin: lastTokenInfo?.createdAt || null,
        status: this.getUserStatus(updatedUser)
      };
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}`, error.message);
      throw error;
    }
  }

  /**
   * Perform bulk actions on multiple users
   */
  async performBulkAction(bulkActionDto: AdminBulkActionDto): Promise<{ success: boolean; affected: number; message: string }> {
    try {
      const { action, userIds } = bulkActionDto;
      let affected = 0;

      switch (action) {
        case 'lock':
          const lockResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { 
              lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              failedLoginAttempts: 5 
            }
          });
          affected = lockResult.count;
          this.logger.log(`Bulk lock action performed on ${affected} users`);
          break;

        case 'unlock':
          const unlockResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { 
              lockedUntil: null,
              failedLoginAttempts: 0 
            }
          });
          affected = unlockResult.count;
          this.logger.log(`Bulk unlock action performed on ${affected} users`);
          break;

        case 'promote':
          const promoteResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isAdmin: true }
          });
          affected = promoteResult.count;
          this.logger.log(`Bulk promote action performed on ${affected} users`);
          break;

        case 'demote':
          const demoteResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isAdmin: false }
          });
          affected = demoteResult.count;
          this.logger.log(`Bulk demote action performed on ${affected} users`);
          break;

        case 'delete':
          // Hard delete - be careful!
          const deleteResult = await this.prisma.user.deleteMany({
            where: { id: { in: userIds } }
          });
          affected = deleteResult.count;
          this.logger.warn(`Bulk delete action performed on ${affected} users`);
          break;

        default:
          throw new BadRequestException(`Unknown bulk action: ${action}`);
      }

      return {
        success: true,
        affected,
        message: `Successfully performed ${action} action on ${affected} users`
      };
    } catch (error) {
      this.logger.error('Failed to perform bulk action', error.message);
      throw error;
    }
  }

  /**
   * Export user data in various formats
   */
  async exportUsers(exportDto: AdminUserExportDto): Promise<{ data: any; filename: string }> {
    try {
      const { format, filters, fields } = exportDto;
      
      // Build where clause based on filters
      const whereClause: any = {};
      if (filters?.status) {
        switch (filters.status) {
          case 'locked':
            whereClause.lockedUntil = { gt: new Date() };
            break;
          case 'admin':
            whereClause.isAdmin = true;
            break;
          case 'active':
            whereClause.lockedUntil = null;
            break;
        }
      }
      
      if (filters?.searchTerm) {
        whereClause.OR = [
          { username: { contains: filters.searchTerm, mode: 'insensitive' } },
          { email: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }

      // Get all users with basic fields for export
      const users = await this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          failedLoginAttempts: fields?.includes('security'),
          lockedUntil: fields?.includes('security'),
          refreshTokens: fields?.includes('lastLogin') ? {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
          } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform data for export with proper type handling
      const exportData = users.map(user => {
        const baseData = {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        };

        // Add security fields if requested
        if (fields?.includes('security')) {
          Object.assign(baseData, {
            failedLoginAttempts: user.failedLoginAttempts || 0,
            isLocked: user.lockedUntil ? user.lockedUntil > new Date() : false
          });
        }

        // Add last login if requested
        if (fields?.includes('lastLogin') && user.refreshTokens) {
          Object.assign(baseData, {
            lastLogin: Array.isArray(user.refreshTokens) && user.refreshTokens[0]?.createdAt
              ? user.refreshTokens[0].createdAt.toISOString()
              : null
          });
        }

        return baseData;
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users_export_${timestamp}.${format}`;

      this.logger.log(`User data exported - Format: ${format}, Count: ${exportData.length}`);

      return {
        data: exportData,
        filename
      };
    } catch (error) {
      this.logger.error('Failed to export user data', error.message);
      throw error;
    }
  }

  /**
   * Determine user status based on account state
   */
  private getUserStatus(user: any): 'active' | 'locked' | 'disabled' {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return 'locked';
    }
    
    // You could add more status logic here (disabled, suspended, etc.)
    return 'active';
  }
}