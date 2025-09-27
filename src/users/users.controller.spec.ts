import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MockHelper } from '../../test/helpers/test-helpers';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have usersService injected', () => {
    expect(usersService).toBeDefined();
  });

  describe('updateMyProfile', () => {
    it('should call usersService.updateUser with correct parameters', async () => {
      // Arrange
      const userId = '123';
      const updateData = { username: 'newusername' };
      const mockRequest = { user: { id: userId } }; // Fixed: use 'id' instead of 'sub'
      const expectedResult = { id: userId, username: 'newusername', email: 'test@test.com' };

      usersService.updateUser.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.updateMyProfile(mockRequest as any, updateData);

      // Assert
      expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = '123';
      const updateData = { username: 'newusername' };
      const mockRequest = { user: { id: userId } }; // Fixed: use 'id' instead of 'sub'
      const error = new Error('Service error');

      usersService.updateUser.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.updateMyProfile(mockRequest as any, updateData))
        .rejects.toThrow('Service error');
      expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });

    it('should extract user ID from req.user.id property', async () => {
      // Arrange
      const userId = 'user-456';
      const updateData = { username: 'updateduser' };
      const mockRequest = { user: { id: userId, email: 'test@test.com' } };
      const expectedResult = { id: userId, username: 'updateduser' };

      usersService.updateUser.mockResolvedValue(expectedResult);

      // Act
      await controller.updateMyProfile(mockRequest as any, updateData);

      // Assert - verify the exact user ID extraction
      expect(usersService.updateUser).toHaveBeenCalledTimes(1);
      expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });
  });
});
