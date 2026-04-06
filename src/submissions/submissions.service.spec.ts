import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { SubmissionEntity, StatusEnum } from './infrastructure/entities/submission.entity';
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
});
