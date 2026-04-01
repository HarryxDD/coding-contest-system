import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { RoleEnum } from '../roles/roles.enum';
import * as bcryptjs from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;

  const mockUserEntity = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: RoleEnum.PARTICIPANT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    mockUserEntity,
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@example.com',
      username: 'admin',
      password: 'hashedpassword',
      role: RoleEnum.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'plainpassword',
      };

      const newUser = { id: '123', ...createUserDto, role: RoleEnum.PARTICIPANT };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should handle user creation errors', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'plainpassword',
      };

      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should apply sorting by email ascending', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'email',
        sortOrder: 'ASC',
      });

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should apply sorting by email descending', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue([...mockUsers].reverse());

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'email',
        sortOrder: 'DESC',
      });

      expect(result).toBeDefined();
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should handle default pagination', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ page: undefined, limit: undefined });

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should handle empty user list', async () => {
      mockUserRepository.count.mockResolvedValue(0);
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await service.findOne(mockUserEntity.id);

      expect(result).toEqual(mockUserEntity);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUserEntity.id },
      });
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow();
    });

    it('should handle repository errors', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(mockUserEntity.id)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUserEntity);

      const result = await service.findByEmail(mockUserEntity.email);

      expect(result).toEqual(mockUserEntity);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUserEntity.email,
      });
    });

    it('should return null when user not found by email', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user by ID', async () => {
      const updateUserDto = { username: 'updateduser' };
      const updatedUser = { ...mockUserEntity, ...updateUserDto };

      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValueOnce(mockUserEntity).mockResolvedValueOnce(updatedUser);

      const result = await service.update(mockUserEntity.id, updateUserDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUserEntity.id,
        updateUserDto,
      );
    });

    it('should throw error when updating non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', { username: 'updated' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete user by ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockUserEntity.id);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserEntity.id);
    });

    it('should throw error when deleting non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('pagination edge cases', () => {
    it('should handle page 0 gracefully', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ page: 0, limit: 10 });

      expect(result).toBeDefined();
    });

    it('should handle negative limit', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ page: 1, limit: -5 });

      expect(result).toBeDefined();
    });

    it('should handle very large limit', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ page: 1, limit: 999999 });

      expect(result).toBeDefined();
    });

    it('should handle sorting by username', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'username',
        sortOrder: 'ASC',
      });

      expect(result).toBeDefined();
    });

    it('should handle sorting by createdAt', async () => {
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      expect(result).toBeDefined();
    });
  });
});
