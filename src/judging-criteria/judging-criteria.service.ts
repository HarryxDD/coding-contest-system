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

  /**
   * creates judging criteria
   * @param dto - the criteria details to create
   * @returns the created judging criteria
   * @throws BadRequestException - when the contest id is missing
   */
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

  /**
   * returns all judging criteria
   * @returns the full judging criteria list
   */
  async findAll() {
    return await this.repository.findAll();
  }

  /**
   * returns judging criteria by id
   * @param id - the judging criteria id
   * @returns the matching judging criteria
   * @throws NotFoundException - when the criteria does not exist
   */
  async findOne(id: string) {
    const criteria = await this.repository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Judging criteria with ID ${id} not found`);
    }
    return criteria;
  }

  /**
   * returns judging criteria for a contest
   * @param contestId - the contest id
   * @returns the contest judging criteria
   */
  async findByContest(contestId: string) {
    return await this.repository.findByContestId(contestId);
  }

  /**
   * updates judging criteria by id
   * @param id - the judging criteria id
   * @param dto - the fields to update
   * @returns the updated judging criteria
   * @throws NotFoundException - when the criteria does not exist
   */
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

  /**
   * removes judging criteria by id
   * @param id - the judging criteria id
   * @returns nothing
   * @throws NotFoundException - when the criteria does not exist
   */
  async remove(id: string) {
    const criteria = await this.repository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Judging criteria with ID ${id} not found`);
    }

    await this.repository.remove(id);
  }

  /**
   * returns paginated judging criteria
   * @param queryDto - the pagination and filter options
   * @returns the paginated judging criteria list
   */
  async findManyWithPagination(queryDto: QueryJudgingCriteriaDto) {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;

    return await this.repository.findManyWithPagination({
      contestId: queryDto.contestId,
      paginationOptions: { page, limit },
    });
  }

  /**
   * counts judging criteria for a contest
   * @param contestId - the contest id
   * @returns the number of judging criteria
   */
  async countByContest(contestId: string): Promise<number> {
    return await this.repository.countByContestId(contestId);
  }
}
