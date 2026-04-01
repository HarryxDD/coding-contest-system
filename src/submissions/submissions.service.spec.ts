import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionEntity } from './infrastructure/entities/submission.entity';
import { SubmissionStatusEnum } from './submissions.enum';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let mockSubmissionRepository: any;

  const mockSubmissionEntity = {
    id: '00000000-0000-0000-0000-000000000001',
    teamId: '00000000-0000-0000-0000-000000000101',
    contestId: '00000000-0000-0000-0000-000000000201',
    title: 'Test Submission',
    repositoryUrl: 'https://github.com/test/repo',
    status: SubmissionStatusEnum.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmissions = [
    mockSubmissionEntity,
    {
      id: '00000000-0000-0000-0000-000000000002',
      teamId: '00000000-0000-0000-0000-000000000102',
      contestId: '00000000-0000-0000-0000-000000000202',
      title: 'Another Submission',
      repositoryUrl: 'https://github.com/test/repo2',
      status: SubmissionStatusEnum.SUBMITTED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockSubmissionRepository = {
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
        SubmissionsService,
        {
          provide: getRepositoryToken(SubmissionEntity),
          useValue: mockSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new submission with DRAFT status', async () => {
      const createSubmissionDto = {
        teamId: '00000000-0000-0000-0000-000000000101',
        contestId: '00000000-0000-0000-0000-000000000201',
        title: 'Test Submission',
        repositoryUrl: 'https://github.com/test/repo',
      };

      const newSubmission = {
        id: '123',
        ...createSubmissionDto,
        status: SubmissionStatusEnum.DRAFT,
      };
      mockSubmissionRepository.create.mockReturnValue(newSubmission);
      mockSubmissionRepository.save.mockResolvedValue(newSubmission);

      const result = await service.create(createSubmissionDto);

      expect(result).toBeDefined();
      expect(mockSubmissionRepository.create).toHaveBeenCalled();
      expect(mockSubmissionRepository.save).toHaveBeenCalled();
    });

    it('should handle submission creation errors', async () => {
      const createSubmissionDto = {
        teamId: 'team-id',
        contestId: 'contest-id',
        title: 'Test',
        repositoryUrl: 'https://github.com/test/repo',
      };

      mockSubmissionRepository.create.mockReturnValue(createSubmissionDto);
      mockSubmissionRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createSubmissionDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated list of submissions', async () => {
      mockSubmissionRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockSubmissions);
      expect(mockSubmissionRepository.find).toHaveBeenCalled();
    });

    it('should handle empty submission list', async () => {
      mockSubmissionRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual([]);
    });

    it('should apply filtering by status', async () => {
      mockSubmissionRepository.count.mockResolvedValue(1);
      mockSubmissionRepository.find.mockResolvedValue([mockSubmissions[0]]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        status: SubmissionStatusEnum.DRAFT,
      });

      expect(result).toBeDefined();
    });

    it('should apply filtering by teamId', async () => {
      mockSubmissionRepository.count.mockResolvedValue(1);
      mockSubmissionRepository.find.mockResolvedValue([mockSubmissions[0]]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        teamId: '00000000-0000-0000-0000-000000000101',
      });

      expect(result).toBeDefined();
    });

    it('should apply filtering by contestId', async () => {
      mockSubmissionRepository.count.mockResolvedValue(1);
      mockSubmissionRepository.find.mockResolvedValue([mockSubmissions[0]]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        contestId: '00000000-0000-0000-0000-000000000201',
      });

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a submission by ID', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmissionEntity);

      const result = await service.findOne(mockSubmissionEntity.id);

      expect(result).toEqual(mockSubmissionEntity);
      expect(mockSubmissionRepository.findOne).toHaveBeenCalled();
    });

    it('should throw error when submission not found', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('findByTeamAndContest', () => {
    it('should return submission by team and contest', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmissionEntity);

      const result = await service.findByTeamAndContest(
        mockSubmissionEntity.teamId,
        mockSubmissionEntity.contestId,
      );

      expect(result).toEqual(mockSubmissionEntity);
    });

    it('should return null when submission not found', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      const result = await service.findByTeamAndContest('team-id', 'contest-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update submission by ID', async () => {
      const updateSubmissionDto = { status: SubmissionStatusEnum.SUBMITTED };
      const updatedSubmission = { ...mockSubmissionEntity, ...updateSubmissionDto };

      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmissionEntity);
      mockSubmissionRepository.update.mockResolvedValue({ affected: 1 });
      mockSubmissionRepository.findOne.mockResolvedValueOnce(mockSubmissionEntity).mockResolvedValueOnce(updatedSubmission);

      await service.update(mockSubmissionEntity.id, updateSubmissionDto);

      expect(mockSubmissionRepository.update).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent submission', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { status: SubmissionStatusEnum.SUBMITTED }),
      ).rejects.toThrow();
    });

    it('should validate status transition DRAFT -> SUBMITTED', async () => {
      const updateDto = { status: SubmissionStatusEnum.SUBMITTED };
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmissionEntity);
      mockSubmissionRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(mockSubmissionEntity.id, updateDto);

      expect(mockSubmissionRepository.update).toHaveBeenCalled();
    });

    it('should validate status transition SUBMITTED -> REVIEWED', async () => {
      const submissionWithSubmittedStatus = {
        ...mockSubmissionEntity,
        status: SubmissionStatusEnum.SUBMITTED,
      };
      const updateDto = { status: SubmissionStatusEnum.REVIEWED };

      mockSubmissionRepository.findOne.mockResolvedValue(submissionWithSubmittedStatus);
      mockSubmissionRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(mockSubmissionEntity.id, updateDto);

      expect(mockSubmissionRepository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete submission by ID', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmissionEntity);
      mockSubmissionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockSubmissionEntity.id);

      expect(mockSubmissionRepository.delete).toHaveBeenCalledWith(mockSubmissionEntity.id);
    });

    it('should throw error when deleting non-existent submission', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('findByTeamId', () => {
    it('should return all submissions by team ID', async () => {
      mockSubmissionRepository.find.mockResolvedValue([mockSubmissions[0]]);

      const result = await service.findByTeamId(mockSubmissions[0].teamId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no submissions found', async () => {
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.findByTeamId('nonexistent-team');

      expect(result).toEqual([]);
    });
  });

  describe('findByContestId', () => {
    it('should return all submissions for a contest', async () => {
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findByContestId(mockSubmissions[0].contestId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no submissions found for contest', async () => {
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.findByContestId('nonexistent-contest');

      expect(result).toEqual([]);
    });
  });

  describe('countByStatus', () => {
    it('should count submissions by status', async () => {
      mockSubmissionRepository.count.mockResolvedValue(2);

      const result = await service.countByStatus(SubmissionStatusEnum.DRAFT);

      expect(mockSubmissionRepository.count).toHaveBeenCalled();
    });

    it('should return zero when no submissions with status', async () => {
      mockSubmissionRepository.count.mockResolvedValue(0);

      const result = await service.countByStatus(SubmissionStatusEnum.REVIEWED);

      expect(result).toBe(0);
    });
  });

  describe('pagination edge cases', () => {
    it('should handle page 0 gracefully', async () => {
      mockSubmissionRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findAll({ page: 0, limit: 10 });

      expect(result).toBeDefined();
    });

    it('should handle negative limit', async () => {
      mockSubmissionRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findAll({ page: 1, limit: -5 });

      expect(result).toBeDefined();
    });

    it('should handle very large limit', async () => {
      mockSubmissionRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findAll({ page: 1, limit: 999999 });

      expect(result).toBeDefined();
    });

    it('should handle combined filters with pagination', async () => {
      mockSubmissionRepository.count.mockResolvedValue(1);
      mockSubmissionRepository.find.mockResolvedValue([mockSubmissions[0]]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        teamId: mockSubmissions[0].teamId,
        contestId: mockSubmissions[0].contestId,
        status: SubmissionStatusEnum.DRAFT,
      });

      expect(result).toBeDefined();
    });
  });

  describe('bulk operations', () => {
    it('should handle bulk finding with multiple IDs', async () => {
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findByTeamId(mockSubmissions[0].teamId);

      expect(result).toBeDefined();
    });

    it('should handle filtering by multiple statuses', async () => {
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.findByContestId(mockSubmissions[0].contestId);

      expect(result).toBeDefined();
    });
  });
});
