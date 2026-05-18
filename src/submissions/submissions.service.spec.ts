import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { StatusEnum } from './infrastructure/entities/submission.entity';
import { submissionRepository } from './infrastructure/submission.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { teamRepository } from '../teams/infrastructure/team.repository';
import { teamMemberRepository } from '../team-members/infrastructure/team-member.repository';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let mockSubmissionRepo: any;
  let mockContestRepo: any;
  let mockTeamRepo: any;
  let mockTeamMemberRepo: any;

  const mockSubmissionEntity = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    teamId: '550e8400-e29b-41d4-a716-446655440101',
    contestId: '550e8400-e29b-41d4-a716-446655440201',
    title: 'Test Submission',
    repositoryUrl: 'https://github.com/test/repo',
    status: StatusEnum.SUBMITTED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock all repositories
    mockSubmissionRepo = {
      create: jest.fn().mockResolvedValue(mockSubmissionEntity),
      findById: jest.fn().mockResolvedValue(mockSubmissionEntity),
      findManyWithPagination: jest.fn().mockResolvedValue({ items: [mockSubmissionEntity], total: 1 }),
      update: jest.fn().mockResolvedValue(mockSubmissionEntity),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockContestRepo = {
      findById: jest.fn().mockResolvedValue({ id: mockSubmissionEntity.contestId, isActive: true }),
    };

    mockTeamRepo = {
      findById: jest.fn().mockResolvedValue({ id: mockSubmissionEntity.teamId, contestId: mockSubmissionEntity.contestId }),
    };

    mockTeamMemberRepo = {
      findByTeamAndUser: jest.fn().mockResolvedValue({ id: 'member-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: submissionRepository,
          useValue: mockSubmissionRepo,
        },
        {
          provide: contestRepository,
          useValue: mockContestRepo,
        },
        {
          provide: teamRepository,
          useValue: mockTeamRepo,
        },
        {
          provide: teamMemberRepository,
          useValue: mockTeamMemberRepo,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createForContest', () => {
    it('should create a new submission with SUBMITTED status', async () => {
      const createSubmissionDto = {
        teamId: '550e8400-e29b-41d4-a716-446655440101',
        title: 'Test Submission',
      };

      const result = await service.createForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        createSubmissionDto as any,
        '550e8400-e29b-41d4-a716-446655440301',
        false,
      );

      expect(result).toBeDefined();
      expect(mockSubmissionRepo.create).toHaveBeenCalled();
    });

    it('should throw error when contest does not exist', async () => {
      mockContestRepo.findById.mockResolvedValue(null);

      await expect(
        service.createForContest('nonexistent', {} as any, 'user-id', false),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when team not provided', async () => {
      await expect(
        service.createForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          { title: 'Test' } as any,
          'user-id',
          false,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions for contest', async () => {
      const queryDto = { page: 1, limit: 10, filters: {}, sort: {} };

      const result = await service.findAllForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        queryDto as any,
      );

      expect(result).toBeDefined();
      expect(mockSubmissionRepo.findManyWithPagination).toHaveBeenCalled();
    });
  });

  describe('findOneForContest', () => {
    it('should return a submission by id', async () => {
      const result = await service.findOneForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toBeDefined();
      expect(mockSubmissionRepo.findById).toHaveBeenCalled();
    });

    it('should throw not found when submission does not exist', async () => {
      mockSubmissionRepo.findById.mockResolvedValue(null);
      await expect(
        service.findOneForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          'nonexistent',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found when submission belongs to different contest', async () => {
      mockSubmissionRepo.findById.mockResolvedValue({
        ...mockSubmissionEntity,
        contestId: 'different-contest-id',
      });
      await expect(
        service.findOneForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          '550e8400-e29b-41d4-a716-446655440001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateForContest', () => {
    it('should update a submission', async () => {
      await service.updateForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
        { title: 'updated title' } as any,
        '550e8400-e29b-41d4-a716-446655440301',
        false,
      );
      expect(mockSubmissionRepo.update).toHaveBeenCalled();
    });

    it('should throw forbidden when user is not a team member', async () => {
      mockTeamMemberRepo.findByTeamAndUser.mockResolvedValue(null);
      await expect(
        service.updateForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          '550e8400-e29b-41d4-a716-446655440001',
          { title: 'updated' } as any,
          'non-member-user',
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update without membership check', async () => {
      mockTeamMemberRepo.findByTeamAndUser.mockResolvedValue(null);
      await service.updateForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
        { title: 'admin update' } as any,
        'admin-user',
        true,
      );
      expect(mockSubmissionRepo.update).toHaveBeenCalled();
    });
  });

  describe('removeForContest', () => {
    it('should remove a submission', async () => {
      await service.removeForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440301',
        false,
      );
      expect(mockSubmissionRepo.remove).toHaveBeenCalled();
    });

    it('should throw forbidden when user is not a team member', async () => {
      mockTeamMemberRepo.findByTeamAndUser.mockResolvedValue(null);
      await expect(
        service.removeForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          '550e8400-e29b-41d4-a716-446655440001',
          'non-member-user',
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createForContest additional cases', () => {
    it('should throw bad request when team does not belong to contest', async () => {
      mockTeamRepo.findById.mockResolvedValue({
        id: mockSubmissionEntity.teamId,
        contestId: 'different-contest',
      });
      await expect(
        service.createForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          { teamId: mockSubmissionEntity.teamId, title: 'test' } as any,
          'user-id',
          false,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw forbidden when user is not a team member', async () => {
      mockTeamMemberRepo.findByTeamAndUser.mockResolvedValue(null);
      await expect(
        service.createForContest(
          '550e8400-e29b-41d4-a716-446655440201',
          { teamId: mockSubmissionEntity.teamId, title: 'test' } as any,
          'non-member',
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to create without membership check', async () => {
      mockTeamMemberRepo.findByTeamAndUser.mockResolvedValue(null);
      await service.createForContest(
        '550e8400-e29b-41d4-a716-446655440201',
        { teamId: mockSubmissionEntity.teamId, title: 'admin submission' } as any,
        'admin-user',
        true,
      );
      expect(mockSubmissionRepo.create).toHaveBeenCalled();
    });
  });
});
