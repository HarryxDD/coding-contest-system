import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { judgeAssignmentRepository } from './infrastructure/judge-assignment.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';

@Injectable()
export class JudgeAssignmentsService {
  constructor(
    private readonly repository: judgeAssignmentRepository,
    private readonly contestRepo: contestRepository,
  ) {}

  /**
   * creates a judge assignment for a contest
   * @param contestId - the contest id
   * @param dto - the assignment details to create
   * @returns the created judge assignment
   * @throws BadRequestException - when the judge id is missing
   * @throws NotFoundException - when the contest does not exist
   * @throws ConflictException - when the judge is already assigned to the contest
   */
  async createForContest(contestId: string, dto: CreateJudgeAssignmentDto) {
    await this.ensureContestExists(contestId);

    if (!dto.judgeId) {
      throw new BadRequestException('judge id is required');
    }

    const existing = await this.repository.findByContestAndJudge(
      contestId,
      dto.judgeId,
    );
    if (existing) {
      throw new ConflictException('judge is already assigned to this contest');
    }

    return this.repository.create({
      contestId,
      judgeId: dto.judgeId,
      assignedAt: new Date(),
    });
  }

  /**
   * returns a judge assignment by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the judge assignment id
   * @returns the matching judge assignment
   * @throws NotFoundException - when the contest or assignment does not exist
   */
  async findOneForContest(contestId: string, id: string) {
    await this.ensureContestExists(contestId);

    const assignment = await this.repository.findById(id);
    if (!assignment || assignment.contestId !== contestId) {
      throw new NotFoundException(`judge assignment with id ${id} not found`);
    }

    return assignment;
  }

  /**
   * returns judge assignments for a specific judge within a contest
   * @param contestId - the contest id
   * @param judgeId - the judge user id
   * @returns the matching judge assignments
   * @throws NotFoundException - when the contest does not exist
   */
  async findByJudgeForContest(contestId: string, judgeId: string) {
    await this.ensureContestExists(contestId);

    const assignment = await this.repository.findByContestAndJudge(
      contestId,
      judgeId,
    );
    return assignment ? [assignment] : [];
  }

  /**
   * returns paginated judge assignments for a contest
   * @param contestId - the contest id
   * @param queryDto - the pagination and filter options
   * @returns the paginated judge assignment list
   * @throws NotFoundException - when the contest does not exist
   */
  async findManyWithPaginationForContest(
    contestId: string,
    queryDto: QueryJudgeAssignmentDto,
  ) {
    await this.ensureContestExists(contestId);

    return this.repository.findManyWithPagination({
      contestId,
      judgeId: queryDto.judgeId,
      paginationOptions: {
        page: queryDto?.page ?? 1,
        limit: queryDto?.limit ?? 10,
      },
    });
  }

  /**
   * removes a judge assignment by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the judge assignment id
   * @returns nothing
   * @throws NotFoundException - when the contest or assignment does not exist
   */
  async removeForContest(contestId: string, id: string) {
    await this.findOneForContest(contestId, id);
    await this.repository.remove(id);
  }

  /**
   * counts judge assignments for a contest
   * @param contestId - the contest id
   * @returns the number of judge assignments
   */
  async countByContest(contestId: string): Promise<number> {
    return this.repository.countByContestId(contestId);
  }

  private async ensureContestExists(contestId: string) {
    const contest = await this.contestRepo.findById(contestId);
    if (!contest) {
      throw new NotFoundException('contest not found');
    }
    return contest;
  }
}