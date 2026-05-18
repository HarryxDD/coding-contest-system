import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { scoreRepository } from './infrastructure/score.repository';
import { submissionRepository } from '../submissions/infrastructure/submission.repository';
import { judgeAssignmentRepository } from '../judge-assignments/infrastructure/judge-assignment.repository';
import { judgingCriteriaRepository } from '../judging-criteria/infrastructure/judging-criteria.repository';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '../roles/roles.enum';

describe('ScoresService', () => {
  let service: ScoresService;
  let mockScoreRepo: any;
  let mockSubmissionRepo: any;
  let mockJudgeAssignmentRepo: any;
  let mockCriteriaRepo: any;

  const mockSubmission = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    contestId: '550e8400-e29b-41d4-a716-446655440010',
    teamId: '550e8400-e29b-41d4-a716-446655440020',
  };

  const mockCriteria = {
    id: '550e8400-e29b-41d4-a716-446655440030',
    contestId: mockSubmission.contestId,
    maxScore: 10,
  };

  const mockScore = {
    id: '550e8400-e29b-41d4-a716-446655440040',
    submissionId: mockSubmission.id,
    judgeId: '550e8400-e29b-41d4-a716-446655440050',
    criteriaId: mockCriteria.id,
    score: 8,
    feedback: 'good work',
  };

  beforeEach(async () => {
    mockScoreRepo = {
      create: jest.fn().mockResolvedValue(mockScore),
      findById: jest.fn().mockResolvedValue(mockScore),
      findManyWithPagination: jest.fn().mockResolvedValue({ items: [mockScore], total: 1 }),
      findBySubmissionJudgeCriteria: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(mockScore),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockSubmissionRepo = {
      findById: jest.fn().mockResolvedValue(mockSubmission),
    };

    mockJudgeAssignmentRepo = {
      findByContestAndJudge: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
    };

    mockCriteriaRepo = {
      findById: jest.fn().mockResolvedValue(mockCriteria),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoresService,
        { provide: scoreRepository, useValue: mockScoreRepo },
        { provide: submissionRepository, useValue: mockSubmissionRepo },
        { provide: judgeAssignmentRepository, useValue: mockJudgeAssignmentRepo },
        { provide: judgingCriteriaRepository, useValue: mockCriteriaRepo },
      ],
    }).compile();

    service = module.get<ScoresService>(ScoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createForSubmission', () => {
    it('should create a score successfully', async () => {
      await service.createForSubmission(
        mockSubmission.id,
        { criteriaId: mockCriteria.id, score: 8 } as any,
        mockScore.judgeId,
      );
      expect(mockScoreRepo.create).toHaveBeenCalled();
    });

    it('should throw not found when submission does not exist', async () => {
      mockSubmissionRepo.findById.mockResolvedValue(null);
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw bad request when criteriaId is missing', async () => {
      await expect(
        service.createForSubmission(mockSubmission.id, { score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request when score is missing', async () => {
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id } as any, mockScore.judgeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw forbidden when judge is not assigned to contest', async () => {
      mockJudgeAssignmentRepo.findByContestAndJudge.mockResolvedValue(null);
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw not found when criteria does not exist', async () => {
      mockCriteriaRepo.findById.mockResolvedValue(null);
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw bad request when criteria belongs to different contest', async () => {
      mockCriteriaRepo.findById.mockResolvedValue({ ...mockCriteria, contestId: 'different-contest' });
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request when score exceeds max score', async () => {
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 99 } as any, mockScore.judgeId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw conflict when judge already scored this criteria', async () => {
      mockScoreRepo.findBySubmissionJudgeCriteria.mockResolvedValue(mockScore);
      await expect(
        service.createForSubmission(mockSubmission.id, { criteriaId: mockCriteria.id, score: 8 } as any, mockScore.judgeId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllForSubmission', () => {
    it('should return paginated scores', async () => {
      const result = await service.findAllForSubmission(mockSubmission.id, { page: 1, limit: 10 } as any);
      expect(result).toBeDefined();
      expect(mockScoreRepo.findManyWithPagination).toHaveBeenCalled();
    });

    it('should throw not found when submission does not exist', async () => {
      mockSubmissionRepo.findById.mockResolvedValue(null);
      await expect(
        service.findAllForSubmission('nonexistent', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneForSubmission', () => {
    it('should return a score by id', async () => {
      const result = await service.findOneForSubmission(mockSubmission.id, mockScore.id);
      expect(result).toBeDefined();
    });

    it('should throw not found when score does not exist', async () => {
      mockScoreRepo.findById.mockResolvedValue(null);
      await expect(
        service.findOneForSubmission(mockSubmission.id, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found when score belongs to different submission', async () => {
      mockScoreRepo.findById.mockResolvedValue({ ...mockScore, submissionId: 'different-submission' });
      await expect(
        service.findOneForSubmission(mockSubmission.id, mockScore.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateForSubmission', () => {
    it('should update a score', async () => {
      await service.updateForSubmission(mockSubmission.id, mockScore.id, { score: 9 } as any, mockScore.judgeId, RoleEnum.JUDGE);
      expect(mockScoreRepo.update).toHaveBeenCalled();
    });

    it('should throw forbidden when judge tries to update another judges score', async () => {
      await expect(
        service.updateForSubmission(mockSubmission.id, mockScore.id, { score: 9 } as any, 'other-judge', RoleEnum.JUDGE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any score', async () => {
      await service.updateForSubmission(mockSubmission.id, mockScore.id, { score: 9 } as any, 'admin-user', RoleEnum.ADMIN);
      expect(mockScoreRepo.update).toHaveBeenCalled();
    });

    it('should throw bad request when updated score exceeds max', async () => {
      await expect(
        service.updateForSubmission(mockSubmission.id, mockScore.id, { score: 99 } as any, mockScore.judgeId, RoleEnum.JUDGE),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeForSubmission', () => {
    it('should remove a score', async () => {
      await service.removeForSubmission(mockSubmission.id, mockScore.id, mockScore.judgeId, RoleEnum.JUDGE);
      expect(mockScoreRepo.remove).toHaveBeenCalled();
    });

    it('should throw forbidden when judge tries to delete another judges score', async () => {
      await expect(
        service.removeForSubmission(mockSubmission.id, mockScore.id, 'other-judge', RoleEnum.JUDGE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to delete any score', async () => {
      await service.removeForSubmission(mockSubmission.id, mockScore.id, 'admin-user', RoleEnum.ADMIN);
      expect(mockScoreRepo.remove).toHaveBeenCalled();
    });
  });
});