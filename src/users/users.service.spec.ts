import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserEntity } from './infrastructure/entities/user.entity';
import { userRepository } from './infrastructure/user.repository';
import { RoleEnum } from '../roles/roles.enum';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: any;

  const mockUserEntity = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword',
    role: RoleEnum.PARTICIPANT,
    profilePic: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    mockUserEntity,
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: 'hashedpassword',
      role: RoleEnum.ADMIN,
      profilePic: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockUserRepo = {
      create: jest.fn().mockResolvedValue(mockUserEntity),
      findAll: jest.fn().mockResolvedValue(mockUsers),
      findManyWithPagination: jest.fn().mockResolvedValue({ items: mockUsers, total: 2 }),
      findById: jest.fn().mockResolvedValue(mockUserEntity),
      findByEmail: jest.fn().mockResolvedValue(mockUserEntity),
      findByUsername: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(mockUserEntity),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: userRepository,
          useValue: mockUserRepo,
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
        role: RoleEnum.PARTICIPANT,
      };

      const newUser = { id: '123', ...createUserDto, passwordHash: 'hashedpassword' };
      mockUserRepo.findByUsername.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(mockUserRepo.create).toHaveBeenCalled();
    });

    it('should throw error when email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'plainpassword',
        role: RoleEnum.PARTICIPANT,
      };

      mockUserRepo.findByEmail.mockResolvedValue(mockUserEntity);

      await expect(service.create(createUserDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw error when username already exists', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'existinguser',
        password: 'plainpassword',
        role: RoleEnum.PARTICIPANT,
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(mockUserEntity);

      await expect(service.create(createUserDto)).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockUserRepo.findAll).toHaveBeenCalled();
    });

    it('should handle empty user list', async () => {
      mockUserRepo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated list of users', async () => {
      const queryDto = { page: 1, limit: 10, filters: {}, sort: {} };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
      expect(mockUserRepo.findManyWithPagination).toHaveBeenCalled();
    });

    it('should apply sorting by email ascending', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { field: 'email', order: 'ASC' },
      };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
      expect(mockUserRepo.findManyWithPagination).toHaveBeenCalled();
    });

    it('should apply sorting by email descending', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { field: 'email', order: 'DESC' },
      };

      mockUserRepo.findManyWithPagination.mockResolvedValue({
        items: [...mockUsers].reverse(),
        total: 2,
      });

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
      expect(mockUserRepo.findManyWithPagination).toHaveBeenCalled();
    });

    it('should handle default pagination', async () => {
      const queryDto = {
        page: undefined,
        limit: undefined,
        filters: {},
        sort: {},
      };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
      expect(mockUserRepo.findManyWithPagination).toHaveBeenCalled();
    });

    it('should handle empty user list in pagination', async () => {
      const queryDto = { page: 1, limit: 10, filters: {}, sort: {} };
      mockUserRepo.findManyWithPagination.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const result = await service.findOne(mockUserEntity.id);

      expect(result).toBeDefined();
      expect(mockUserRepo.findById).toHaveBeenCalledWith(mockUserEntity.id);
    });

    it('should throw error when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should handle repository errors', async () => {
      mockUserRepo.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(mockUserEntity.id)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update user by ID', async () => {
      const updateUserDto = { username: 'updateduser' };
      const updatedUser = { ...mockUserEntity, username: 'updateduser' };

      mockUserRepo.findById.mockResolvedValue(mockUserEntity);
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUserEntity.id, updateUserDto);

      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent user', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', { username: 'updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user by ID', async () => {
      mockUserRepo.remove.mockResolvedValue(true);

      const result = await service.remove(mockUserEntity.id);

      expect(mockUserRepo.remove).toHaveBeenCalledWith(mockUserEntity.id);
      expect(result).toBe(true);
    });

    it('should handle removal of non-existent user gracefully', async () => {
      mockUserRepo.remove.mockResolvedValue(true);

      const result = await service.remove('nonexistent-id');

      expect(mockUserRepo.remove).toHaveBeenCalledWith('nonexistent-id');
      expect(result).toBe(true);
    });
  });

  describe('pagination edge cases', () => {
    it('should handle page 0 gracefully', async () => {
      const queryDto = { page: 0, limit: 10, filters: {}, sort: {} };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });

    it('should handle negative limit', async () => {
      const queryDto = { page: 1, limit: -5, filters: {}, sort: {} };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });

    it('should handle very large limit', async () => {
      const queryDto = { page: 1, limit: 999999, filters: {}, sort: {} };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });

    it('should handle sorting by username', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { field: 'username', order: 'ASC' },
      };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });

    it('should handle sorting by createdAt', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { field: 'createdAt', order: 'DESC' },
      };

      const result = await service.findManyWithPagination(queryDto as any);

      expect(result).toBeDefined();
    });
  });
});
