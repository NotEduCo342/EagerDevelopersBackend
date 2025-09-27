import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserFactory } from '../../test/helpers/test-factories';
import { MockHelper } from '../../test/helpers/test-helpers';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any; // Use any type to avoid strict typing issues

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: MockHelper.createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should successfully update user and exclude password from response', async () => {
      // Arrange
      const userId = '1';
      const updateData = { username: 'newusername' };
      const updatedUser = UserFactory.build({
        username: updateData.username,
        password: 'hashedPassword123',
      });

      prismaService.user.update.mockResolvedValue({
        id: parseInt(userId),
        ...updatedUser,
      } as any);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe(updateData.username);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = '1';
      const updateData = { username: 'newusername' };
      prismaService.user.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.updateUser(userId, updateData)).rejects.toThrow('Database error');
    });

    it('should pass through update data to Prisma', async () => {
      // Arrange
      const userId = '2';
      const updateData = { username: 'updateduser' };
      const updatedUser = UserFactory.build(updateData);

      prismaService.user.update.mockResolvedValue({
        id: parseInt(userId),
        ...updatedUser,
      } as any);

      // Act
      await service.updateUser(userId, updateData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it('should handle empty update data', async () => {
      // Arrange
      const userId = '3';
      const updateData = {};
      const originalUser = UserFactory.build();

      prismaService.user.update.mockResolvedValue({
        id: parseInt(userId),
        ...originalUser,
      } as any);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
