import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { judgeAssignmentRepository } from './infrastructure/judge-assignment.repository';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';

@Injectable()
export class JudgeAssignmentsService {
  constructor(
    private readonly repository: judgeAssignmentRepository,
  ) {}

  /**
   * creates a judge assignment
   * @param dto - the assignment details to create
   * @returns the created judge assignment
   * @throws BadRequestException - when the contest id or judge id is missing
   * @throws ConflictException - when the judge is already assigned to the contest
   */
  async create(dto: CreateJudgeAssignmentDto) {
    if (!dto.contestId || !dto.judgeId) {
      throw new BadRequestException('Contest ID and Judge ID are required');
    }

    // Check if assignment already exists
    const existing = await this.repository.findByContestAndJudge(dto.contestId, dto.judgeId);
    if (existing) {
      throw new ConflictException('Judge is already assigned to this contest');
    }

    const assignment = await this.repository.create({
      contestId: dto.contestId,
      judgeId: dto.judgeId,
      assignedAt: new Date(),
    });

    return assignment;
  }

  /**
   * returns all judge assignments
   * @returns the full judge assignment list
   */
  async findAll() {
    return await this.repository.findAll();
  }

  /**
   * returns a judge assignment by id
   * @param id - the judge assignment id
   * @returns the matching judge assignment
   * @throws NotFoundException - when the assignment does not exist
   */
  async findOne(id: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Judge assignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * returns judge assignments for a contest
   * @param contestId - the contest id
   * @returns the contest judge assignments
   */
  async findByContest(contestId: string) {
    return await this.repository.findByContestId(contestId);
  }

  /**
   * returns judge assignments for a judge
   * @param judgeId - the judge user id
   * @returns the judge assignments
   */
  async findByJudge(judgeId: string) {
    return await this.repository.findByJudgeId(judgeId);
  }

  /**
   * removes a judge assignment by id
   * @param id - the judge assignment id
   * @returns nothing
   * @throws NotFoundException - when the assignment does not exist
   */
  async remove(id: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Judge assignment with ID ${id} not found`);
    }

    await this.repository.remove(id);
  }

  /**
   * returns paginated judge assignments
   * @param queryDto - the pagination and filter options
   * @returns the paginated judge assignment list
   */
  async findManyWithPagination(queryDto: QueryJudgeAssignmentDto) {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;

    return await this.repository.findManyWithPagination({
      contestId: queryDto.contestId,
      judgeId: queryDto.judgeId,
      paginationOptions: { page, limit },
    });
  }

  /**
   * counts judge assignments for a contest
   * @param contestId - the contest id
   * @returns the number of judge assignments
   */
  async countByContest(contestId: string): Promise<number> {
    return await this.repository.countByContestId(contestId);
  }
}
