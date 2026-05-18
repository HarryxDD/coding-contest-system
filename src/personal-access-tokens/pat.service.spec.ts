import { Test, TestingModule } from '@nestjs/testing';
import { PatService } from './pat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersonalAccessTokenEntity } from './infrastructure/entities/personal-access-token.entity';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { RoleEnum } from '../roles/roles.enum';

describe('PatService', () => {
  let service: PatService;
  let mockPatRepository: any;

  const mockToken = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440099',
    tokenHash: 'hashedtoken',
    role: RoleEnum.PARTICIPANT,
    permissions: ['contest:read'],
    enabled: true,
    expiresAt: null,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPatRepository = {
      find: jest.fn().mockResolvedValue([mockToken]),
      findOne: jest.fn().mockResolvedValue(mockToken),
      save: jest.fn().mockResolvedValue(mockToken),
      create: jest.fn().mockReturnValue(mockToken),
      update: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatService,
        {
          provide: getRepositoryToken(PersonalAccessTokenEntity),
          useValue: mockPatRepository,
        },
      ],
    }).compile();

    service = module.get<PatService>(PatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('allowedScopesForRole', () => {
    it('should return wildcard for admin', () => {
      const scopes = service.allowedScopesForRole(RoleEnum.ADMIN);
      expect(scopes.has('*')).toBe(true);
    });

    it('should return organizer scopes', () => {
      const scopes = service.allowedScopesForRole(RoleEnum.ORGANIZER);
      expect(scopes.has('contest:read')).toBe(true);
      expect(scopes.has('contest:write')).toBe(true);
    });

    it('should return judge scopes', () => {
      const scopes = service.allowedScopesForRole(RoleEnum.JUDGE);
      expect(scopes.has('score:write')).toBe(true);
      expect(scopes.has('submission:read')).toBe(true);
    });

    it('should return participant scopes', () => {
      const scopes = service.allowedScopesForRole(RoleEnum.PARTICIPANT);
      expect(scopes.has('submission:write')).toBe(true);
      expect(scopes.has('contest:read')).toBe(true);
    });
  });

  describe('createForUser', () => {
    it('should create a token and return raw token and record', async () => {
      const result = await service.createForUser({
        userId: mockToken.userId,
        role: RoleEnum.PARTICIPANT,
        permissions: ['contest:read'],
        expiresAt: null,
      });
      expect(result.token).toBeDefined();
      expect(result.record).toBeDefined();
      expect(mockPatRepository.save).toHaveBeenCalled();
    });

    it('should throw forbidden when permissions not allowed for role', async () => {
      await expect(
        service.createForUser({
          userId: mockToken.userId,
          role: RoleEnum.PARTICIPANT,
          permissions: ['score:write'],
          expiresAt: null,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to create token with any permission', async () => {
      const result = await service.createForUser({
        userId: mockToken.userId,
        role: RoleEnum.ADMIN,
        permissions: ['*'],
        expiresAt: null,
      });
      expect(result.token).toBeDefined();
    });
  });

  describe('listForUser', () => {
    it('should return tokens for a user', async () => {
      const result = await service.listForUser(mockToken.userId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockPatRepository.find).toHaveBeenCalled();
    });
  });

  describe('revokeForUser', () => {
    it('should revoke a token when requester is the owner', async () => {
      await service.revokeForUser({
        tokenId: mockToken.id,
        requesterUserId: mockToken.userId,
        requesterRole: RoleEnum.PARTICIPANT,
      });
      expect(mockPatRepository.update).toHaveBeenCalled();
    });

    it('should allow admin to revoke any token', async () => {
      await service.revokeForUser({
        tokenId: mockToken.id,
        requesterUserId: 'other-user',
        requesterRole: RoleEnum.ADMIN,
      });
      expect(mockPatRepository.update).toHaveBeenCalled();
    });

    it('should throw forbidden when requester is not the owner', async () => {
      await expect(
        service.revokeForUser({
          tokenId: mockToken.id,
          requesterUserId: 'other-user',
          requesterRole: RoleEnum.PARTICIPANT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return silently when token does not exist', async () => {
      mockPatRepository.findOne.mockResolvedValue(null);
      await expect(
        service.revokeForUser({
          tokenId: 'nonexistent',
          requesterUserId: mockToken.userId,
          requesterRole: RoleEnum.PARTICIPANT,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('validateRawToken', () => {
    it('should throw unauthorized when token is empty', async () => {
      await expect(service.validateRawToken('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw unauthorized when token not found', async () => {
      mockPatRepository.findOne.mockResolvedValue(null);
      await expect(service.validateRawToken('invalid-raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw unauthorized when token is expired', async () => {
      mockPatRepository.findOne.mockResolvedValue({
        ...mockToken,
        expiresAt: new Date('2020-01-01'),
      });
      await expect(service.validateRawToken('valid-raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return token record when valid', async () => {
      mockPatRepository.findOne.mockResolvedValue({
        ...mockToken,
        expiresAt: null,
      });
      const result = await service.validateRawToken('valid-raw-token');
      expect(result).toBeDefined();
      expect(mockPatRepository.update).toHaveBeenCalled();
    });
  });
});