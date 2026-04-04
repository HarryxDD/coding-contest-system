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

  /**
   * creates a score for a submission
   * @param submissionId - the submission id
   * @param createDto - the score details to create
   * @param judgeId - the judge user id
   * @returns the created score
   * @throws BadRequestException - when criteria id or score is missing or score exceeds max
   * @throws NotFoundException - when the submission or criteria does not exist
   * @throws ForbiddenException - when the judge is not assigned to the contest
   * @throws ConflictException - when the judge already scored this criteria for this submission
   */
  async createForSubmission(
    submissionId: string,
    createDto: CreateScoreDto,
    judgeId: string,
  ) {
    const submission = await this.ensureSubmissionExists(submissionId);

    if (!createDto.criteriaId || createDto.score === undefined) {
      throw new BadRequestException('criteria id and score are required');
    }

    const assignment = await this.judgeAssignmentRepo.findByContestAndJudge(
      submission.contestId,
      judgeId,
    );
    if (!assignment) {
      throw new ForbiddenException('you are not assigned to judge this contest');
    }

    const criteria = await this.criteriaRepo.findById(createDto.criteriaId);
    if (!criteria) throw new NotFoundException('judging criteria not found');

    if (criteria.contestId !== submission.contestId) {
      throw new BadRequestException('judging criteria does not belong to this contest');
    }

    if (createDto.score > criteria.maxScore) {
      throw new BadRequestException(
        `score ${createDto.score} exceeds the max allowed score of ${criteria.maxScore}`,
      );
    }

    const duplicate = await this.scoreRepo.findBySubmissionJudgeCriteria(
      submissionId,
      judgeId,
      createDto.criteriaId,
    );
    if (duplicate) {
      throw new ConflictException('you have already scored this submission for this criteria');
    }

    return this.scoreRepo.create({ ...createDto, submissionId, judgeId });
  }

  /**
   * returns paginated scores for a submission
   * @param submissionId - the submission id
   * @param queryDto - the pagination and filter options
   * @returns the paginated score list
   * @throws NotFoundException - when the submission does not exist
   */
  async findAllForSubmission(submissionId: string, queryDto: QueryScoreDto) {
    await this.ensureSubmissionExists(submissionId);

    return this.scoreRepo.findManyWithPagination({
      filterOptions: {
        ...queryDto.filters,
        submissionId,
      },
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  /**
   * returns a score by id scoped to a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @returns the matching score
   * @throws NotFoundException - when the submission or score does not exist
   */
  async findOneForSubmission(submissionId: string, id: string) {
    await this.ensureSubmissionExists(submissionId);

    const score = await this.scoreRepo.findById(id);
    if (!score || score.submissionId !== submissionId) {
      throw new NotFoundException('score not found');
    }

    return score;
  }

  /**
   * updates a score by id scoped to a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @param updateDto - the fields to update
   * @param userId - the user making the request
   * @param userRole - the role of the requester
   * @returns the updated score
   * @throws ForbiddenException - when a judge tries to update another judge's score
   * @throws BadRequestException - when the updated score exceeds the criteria max score
   */
  async updateForSubmission(
    submissionId: string,
    id: string,
    updateDto: UpdateScoreDto,
    userId: string,
    userRole: RoleEnum,
  ) {
    const score = await this.findOneForSubmission(submissionId, id);
    const isAdmin = userRole === RoleEnum.ADMIN;

    if (!isAdmin && score.judgeId !== userId) {
      throw new ForbiddenException('you can only update your own scores');
    }

    if (updateDto.score !== undefined) {
      const criteria = await this.criteriaRepo.findById(score.criteriaId);
      if (criteria && updateDto.score > criteria.maxScore) {
        throw new BadRequestException(
          `score ${updateDto.score} exceeds the max allowed score of ${criteria.maxScore}`,
        );
      }
    }

    return this.scoreRepo.update(id, updateDto);
  }

  /**
   * removes a score by id scoped to a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @param userId - the user making the request
   * @param userRole - the role of the requester
   * @returns nothing
   * @throws ForbiddenException - when a judge tries to delete another judge's score
   */
  async removeForSubmission(
    submissionId: string,
    id: string,
    userId: string,
    userRole: RoleEnum,
  ) {
    const score = await this.findOneForSubmission(submissionId, id);
    const isAdmin = userRole === RoleEnum.ADMIN;

    if (!isAdmin && score.judgeId !== userId) {
      throw new ForbiddenException('you can only delete your own scores');
    }

    await this.scoreRepo.remove(id);
  }

  private async ensureSubmissionExists(submissionId: string) {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('submission not found');
    }
    return submission;
  }
}