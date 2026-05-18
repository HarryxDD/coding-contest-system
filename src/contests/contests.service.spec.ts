import { Test, TestingModule } from '@nestjs/testing';
import { ContestsService } from './contests.service';
import { contestRepository } from './infrastructure/contest.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ContestsService', () => {
  let service: ContestsService;
  let mockContestRepo: any;
  let mockCacheManager: any;

  const mockContest = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Contest',
    organizerId: '550e8400-e29b-41d4-a716-446655440099',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-10'),
    submissionDeadline: new Date('2026-01-08'),
    isActive: true,
  };

  beforeEach(async () => {
    mockContestRepo = {
      create: jest.fn().mockResolvedValue(mockContest),
      findById: jest.fn().mockResolvedValue(mockContest),
      findManyWithPagination: jest.fn().mockResolvedValue({ items: [mockContest], total: 1 }),
      update: jest.fn().mockResolvedValue(mockContest),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockCacheManager = {
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestsService,
        {
          provide: contestRepository,
          useValue: mockContestRepo,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ContestsService>(ContestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a contest and invalidate cache', async () => {
      const dto = {
        name: 'Test Contest',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        submissionDeadline: '2026-01-08',
        maxTeamSize: 4,
      };
      await service.create(dto as any, mockContest.organizerId);
      expect(mockContestRepo.create).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalledWith('contests_list');
    });

    it('should throw bad request when end date is not after start date', async () => {
      const dto = {
        name: 'Bad Contest',
        startDate: '2026-01-10',
        endDate: '2026-01-01',
        submissionDeadline: '2026-01-08',
        maxTeamSize: 4,
      };
      await expect(service.create(dto as any, mockContest.organizerId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated contests', async () => {
      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result).toBeDefined();
      expect(mockContestRepo.findManyWithPagination).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a contest by id', async () => {
      const result = await service.findOne(mockContest.id);
      expect(result).toBeDefined();
      expect(mockContestRepo.findById).toHaveBeenCalledWith(mockContest.id);
    });

    it('should throw not found when contest does not exist', async () => {
      mockContestRepo.findById.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a contest and invalidate cache', async () => {
      await service.update(
        mockContest.id,
        { name: 'updated' } as any,
        mockContest.organizerId,
        false,
      );
      expect(mockContestRepo.update).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalledWith('contests_list');
    });

    it('should throw forbidden when requester is not the organizer', async () => {
      await expect(
        service.update(mockContest.id, { name: 'updated' } as any, 'other-user', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any contest', async () => {
      await service.update(
        mockContest.id,
        { name: 'admin update' } as any,
        'admin-user',
        true,
      );
      expect(mockContestRepo.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a contest and invalidate cache', async () => {
      await service.remove(mockContest.id, mockContest.organizerId, false);
      expect(mockContestRepo.remove).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalledWith('contests_list');
    });

    it('should throw forbidden when requester is not the organizer', async () => {
      await expect(
        service.remove(mockContest.id, 'other-user', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to remove any contest', async () => {
      await service.remove(mockContest.id, 'admin-user', true);
      expect(mockContestRepo.remove).toHaveBeenCalled();
    });
  });
});