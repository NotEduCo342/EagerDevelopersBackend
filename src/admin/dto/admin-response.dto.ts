import { ApiProperty } from '@nestjs/swagger';

export class AdminUserDto {
  @ApiProperty({ 
    example: 'clp1234567890',
    description: 'Unique user identifier'
  })
  id: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User email address'
  })
  email: string;

  @ApiProperty({ 
    example: 'johndoe123',
    description: 'Username'
  })
  username: string;

  @ApiProperty({ 
    example: false,
    description: 'Admin privileges status'
  })
  isAdmin: boolean;

  @ApiProperty({ 
    example: 2,
    description: 'Failed login attempts count'
  })
  failedLoginAttempts: number;

  @ApiProperty({ 
    example: null,
    description: 'Account locked until timestamp',
    nullable: true
  })
  lockedUntil: Date | null;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00.000Z',
    description: 'Account creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({ 
    example: '2024-01-15T14:30:00.000Z',
    description: 'Last account update timestamp'
  })
  updatedAt: Date;

  @ApiProperty({ 
    example: '2024-01-15T09:45:00.000Z',
    description: 'Last login timestamp',
    nullable: true
  })
  lastLogin?: Date | null;

  @ApiProperty({ 
    example: 'active',
    description: 'Account status',
    enum: ['active', 'locked', 'disabled']
  })
  status: 'active' | 'locked' | 'disabled';
}

export class AdminStatsOverviewDto {
  @ApiProperty({ 
    example: 1247,
    description: 'Total registered users'
  })
  totalUsers: number;

  @ApiProperty({ 
    example: 23,
    description: 'New users registered today'
  })
  newUsersToday: number;

  @ApiProperty({ 
    example: 89,
    description: 'Currently active user sessions'
  })
  activeSessions: number;

  @ApiProperty({ 
    example: 'UP',
    description: 'Overall system health status'
  })
  systemHealth: string;

  @ApiProperty({ 
    example: 156789,
    description: 'Total API calls in the last 24 hours'
  })
  apiCallsToday: number;

  @ApiProperty({ 
    example: 3,
    description: 'Failed login attempts in the last hour'
  })
  failedLoginsLastHour: number;

  @ApiProperty({ 
    example: 1,
    description: 'Number of currently locked accounts'
  })
  lockedAccounts: number;

  @ApiProperty({ 
    example: 98.7,
    description: 'System uptime percentage'
  })
  uptimePercentage: number;
}

export class AdminUserListDto {
  @ApiProperty({ 
    type: [AdminUserDto],
    description: 'Array of user objects'
  })
  users: AdminUserDto[];

  @ApiProperty({ 
    example: 1247,
    description: 'Total number of users'
  })
  total: number;

  @ApiProperty({ 
    example: 1,
    description: 'Current page number'
  })
  page: number;

  @ApiProperty({ 
    example: 20,
    description: 'Number of users per page'
  })
  limit: number;

  @ApiProperty({ 
    example: 63,
    description: 'Total number of pages'
  })
  totalPages: number;

  @ApiProperty({ 
    example: 'createdAt',
    description: 'Field used for sorting'
  })
  sortBy: string;

  @ApiProperty({ 
    example: 'desc',
    description: 'Sort order (asc/desc)'
  })
  sortOrder: 'asc' | 'desc';

  @ApiProperty({ 
    example: 'john',
    description: 'Applied search filter',
    nullable: true
  })
  searchTerm?: string;

  @ApiProperty({ 
    example: 'active',
    description: 'Applied status filter',
    nullable: true
  })
  statusFilter?: string;
}

export class AdminUserUpdateDto {
  @ApiProperty({ 
    example: 'newusername123',
    description: 'New username for the user',
    required: false
  })
  username?: string;

  @ApiProperty({ 
    example: 'newemail@example.com',
    description: 'New email address for the user',
    required: false
  })
  email?: string;

  @ApiProperty({ 
    example: false,
    description: 'Admin status (true/false)',
    required: false
  })
  isAdmin?: boolean;

  @ApiProperty({ 
    example: 'newSecurePassword123!',
    description: 'New password for the user',
    required: false
  })
  password?: string;

  @ApiProperty({ 
    example: true,
    description: 'Whether to unlock the account',
    required: false
  })
  unlockAccount?: boolean;
}

export class AdminBulkActionDto {
  @ApiProperty({ 
    example: ['clp1234567890', 'clp0987654321'],
    description: 'Array of user IDs to perform action on'
  })
  userIds: string[];

  @ApiProperty({ 
    example: 'unlock',
    description: 'Action to perform on selected users',
    enum: ['unlock', 'lock', 'promote', 'demote', 'delete']
  })
  action: 'unlock' | 'lock' | 'promote' | 'demote' | 'delete';
}

export class AdminUserExportDto {
  @ApiProperty({ 
    example: 'csv',
    description: 'Export format',
    enum: ['csv', 'json']
  })
  format: 'csv' | 'json';

  @ApiProperty({ 
    example: ['id', 'email', 'username', 'createdAt'],
    description: 'Fields to include in export'
  })
  fields: string[];

  @ApiProperty({ 
    description: 'Filters to apply during export',
    required: false
  })
  filters?: {
    status?: string;
    searchTerm?: string;
  };
}

export class AdminActionResponseDto {
  @ApiProperty({ 
    example: true,
    description: 'Whether the action was successful'
  })
  success: boolean;

  @ApiProperty({ 
    example: 'User account unlocked successfully',
    description: 'Action result message'
  })
  message: string;

  @ApiProperty({ 
    example: '2024-01-15T14:30:00.000Z',
    description: 'Timestamp of the action'
  })
  timestamp: string;

  @ApiProperty({ 
    example: 'clp1234567890',
    description: 'ID of the affected user',
    nullable: true
  })
  userId?: string;
}