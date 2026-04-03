import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { judgingCriteriaRepository } from './infrastructure/judging-criteria.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { CreateJudgingCriteriaDto } from './dto/create-judging-criteria.dto';
import { UpdateJudgingCriteriaDto } from './dto/update-judging-criteria.dto';
import { QueryJudgingCriteriaDto } from './dto/query-judging-criteria.dto';

@Injectable()
export class JudgingCriteriaService {
  constructor(
    private readonly repository: judgingCriteriaRepository,
    private readonly contestRepo: contestRepository,
  ) {}

  /**
   * creates judging criteria for a contest
   * @param contestId - the contest id
   * @param dto - the criteria details to create
   * @returns the created judging criteria
   * @throws BadRequestException - when the name or max score is missing
   * @throws NotFoundException - when the contest does not exist
   */
  async createForContest(contestId: string, dto: CreateJudgingCriteriaDto) {
    await this.ensureContestExists(contestId);

    if (!dto.name?.trim() || dto.maxScore === undefined) {
      throw new BadRequestException('name and max score are required');
    }

    return this.repository.create({
      contestId,
      name: dto.name,
      description: dto.description,
      maxScore: dto.maxScore,
    });
  }

  /**
   * returns judging criteria by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @returns the matching judging criteria
   * @throws NotFoundException - when the contest or criteria does not exist
   */
  async findOneForContest(contestId: string, id: string) {
    await this.ensureContestExists(contestId);

    const criteria = await this.repository.findById(id);
    if (!criteria || criteria.contestId !== contestId) {
      throw new NotFoundException(`judging criteria with id ${id} not found`);
    }

    return criteria;
  }

  /**
   * updates judging criteria by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @param dto - the fields to update
   * @returns the updated judging criteria
   * @throws NotFoundException - when the contest or criteria does not exist
   */
  async updateForContest(contestId: string, id: string, dto: UpdateJudgingCriteriaDto) {
    const criteria = await this.findOneForContest(contestId, id);

    return this.repository.update(id, {
      name: dto.name ?? criteria.name,
      description: dto.description ?? criteria.description,
      maxScore: dto.maxScore ?? criteria.maxScore,
    });
  }

  /**
   * removes judging criteria by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @returns nothing
   * @throws NotFoundException - when the contest or criteria does not exist
   */
  async removeForContest(contestId: string, id: string) {
    await this.findOneForContest(contestId, id);
    await this.repository.remove(id);
  }

  /**
   * returns paginated judging criteria for a contest
   * @param contestId - the contest id
   * @param queryDto - the pagination and filter options
   * @returns the paginated judging criteria list
   * @throws NotFoundException - when the contest does not exist
   */
  async findManyWithPaginationForContest(
    contestId: string,
    queryDto: QueryJudgingCriteriaDto,
  ) {
    await this.ensureContestExists(contestId);

    return this.repository.findManyWithPagination({
      contestId,
      paginationOptions: {
        page: queryDto?.page ?? 1,
        limit: queryDto?.limit ?? 10,
      },
    });
  }

  /**
   * counts judging criteria for a contest
   * @param contestId - the contest id
   * @returns the number of judging criteria
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