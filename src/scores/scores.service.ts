import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { scoreRepository } from './infrastructure/score.repository';
import { submissionRepository } from '../submissions/infrastructure/submission.repository';
import { judgeAssignmentRepository } from '../judge-assignments/infrastructure/judge-assignment.repository';
import { judgingCriteriaRepository } from '../judging-criteria/infrastructure/judging-criteria.repository';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { QueryScoreDto } from './dto/query-score.dto';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class ScoresService {
  constructor(
    private readonly scoreRepo: scoreRepository,
    private readonly submissionRepo: submissionRepository,
    private readonly judgeAssignmentRepo: judgeAssignmentRepository,
    private readonly criteriaRepo: judgingCriteriaRepository,
  ) {}

  async create(createDto: CreateScoreDto, judgeId: string) {
    // find the submission to get its contest
    const submission = await this.submissionRepo.findById(
      createDto.submissionId,
    );
    if (!submission) throw new NotFoundException('Submission not found');

    // judge must be assigned to that contest
    const assignment = await this.judgeAssignmentRepo.findByContestAndJudge(
      submission.contestId,
      judgeId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'You are not assigned to judge this contest',
      );
    }

    // fetch criteria to validate max_score
    const criteria = await this.criteriaRepo.findById(createDto.criteriaId);
    if (!criteria) throw new NotFoundException('Judging criteria not found');

    if (createDto.score > criteria.maxScore) {
      throw new BadRequestException(
        `Score ${createDto.score} exceeds the max allowed score of ${criteria.maxScore}`,
      );
    }

    // each judge can only score a submission+criteria pair once
    const duplicate = await this.scoreRepo.findBySubmissionJudgeCriteria(
      createDto.submissionId,
      judgeId,
      createDto.criteriaId,
    );
    if (duplicate) {
      throw new ConflictException(
        'You have already scored this submission for this criteria',
      );
    }

    return this.scoreRepo.create({ ...createDto, judgeId });
  }

  async findAll(queryDto: QueryScoreDto) {
    return this.scoreRepo.findManyWithPagination({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  async findOne(id: string) {
    const score = await this.scoreRepo.findById(id);
    if (!score) throw new NotFoundException('Score not found');
    return score;
  }

  async update(
    id: string,
    updateDto: UpdateScoreDto,
    userId: string,
    userRole: RoleEnum,
  ) {
    const score = await this.findOne(id);
    const isAdmin = userRole === RoleEnum.ADMIN;

    if (!isAdmin && score.judgeId !== userId) {
      throw new ForbiddenException('You can only update your own scores');
    }

    // if changing the score value, re-validate it against max_score
    if (updateDto.score !== undefined) {
      const criteria = await this.criteriaRepo.findById(score.criteriaId);
      if (criteria && updateDto.score > criteria.maxScore) {
        throw new BadRequestException(
          `Score ${updateDto.score} exceeds the max allowed score of ${criteria.maxScore}`,
        );
      }
    }

    return this.scoreRepo.update(id, updateDto);
  }

  async remove(id: string, userId: string, userRole: RoleEnum) {
    const score = await this.findOne(id);
    const isAdmin = userRole === RoleEnum.ADMIN;

    if (!isAdmin && score.judgeId !== userId) {
      throw new ForbiddenException('You can only delete your own scores');
    }

    await this.scoreRepo.remove(id);
  }
}
