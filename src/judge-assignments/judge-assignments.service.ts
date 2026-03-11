import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { judgeAssignmentRepository } from './infrastructure/judge-assignment.repository';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';

@Injectable()
export class JudgeAssignmentsService {
  constructor(
    private readonly repository: judgeAssignmentRepository,
  ) {}

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

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Judge assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async findByContest(contestId: string) {
    return await this.repository.findByContestId(contestId);
  }

  async findByJudge(judgeId: string) {
    return await this.repository.findByJudgeId(judgeId);
  }

  async remove(id: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Judge assignment with ID ${id} not found`);
    }

    await this.repository.remove(id);
  }

  async findManyWithPagination(queryDto: QueryJudgeAssignmentDto) {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;

    return await this.repository.findManyWithPagination({
      contestId: queryDto.contestId,
      judgeId: queryDto.judgeId,
      paginationOptions: { page, limit },
    });
  }

  async countByContest(contestId: string): Promise<number> {
    return await this.repository.countByContestId(contestId);
  }
}
