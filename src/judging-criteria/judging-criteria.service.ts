import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { judgingCriteriaRepository } from './infrastructure/judging-criteria.repository';
import { CreateJudgingCriteriaDto } from './dto/create-judging-criteria.dto';
import { UpdateJudgingCriteriaDto } from './dto/update-judging-criteria.dto';
import { QueryJudgingCriteriaDto } from './dto/query-judging-criteria.dto';

@Injectable()
export class JudgingCriteriaService {
  constructor(
    private readonly repository: judgingCriteriaRepository,
  ) {}

  async create(dto: CreateJudgingCriteriaDto) {
    if (!dto.contestId) {
      throw new BadRequestException('Contest ID is required');
    }

    const criteria = await this.repository.create({
      contestId: dto.contestId,
      name: dto.name,
      description: dto.description,
      maxScore: dto.maxScore,
    });

    return criteria;
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: string) {
    const criteria = await this.repository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Judging criteria with ID ${id} not found`);
    }
    return criteria;
  }

  async findByContest(contestId: string) {
    return await this.repository.findByContestId(contestId);
  }

  async update(id: string, dto: UpdateJudgingCriteriaDto) {
    const criteria = await this.repository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Judging criteria with ID ${id} not found`);
    }

    return await this.repository.update(id, {
      name: dto.name ?? criteria.name,
      description: dto.description ?? criteria.description,
      maxScore: dto.maxScore ?? criteria.maxScore,
    });
  }

  async remove(id: string) {
    const criteria = await this.repository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Judging criteria with ID ${id} not found`);
    }

    await this.repository.remove(id);
    return { message: 'Judging criteria deleted successfully' };
  }

  async findManyWithPagination(queryDto: QueryJudgingCriteriaDto) {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;

    return await this.repository.findManyWithPagination({
      contestId: queryDto.contestId,
      paginationOptions: { page, limit },
    });
  }

  async countByContest(contestId: string): Promise<number> {
    return await this.repository.countByContestId(contestId);
  }
}
