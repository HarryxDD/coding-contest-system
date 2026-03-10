import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ScoreEntity } from '../entities/score.entity';
import { Score } from '../../domain/score';
import { scoreRepository } from '../score.repository';
import { ScoreMapper } from '../mappers/score.mapper';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { FilterScoreDto, SortScoreDto } from '../../dto/query-score.dto';

@Injectable()
export class ScoresRelationalRepository implements scoreRepository {
  constructor(
    @InjectRepository(ScoreEntity)
    private readonly scoresRepo: Repository<ScoreEntity>,
  ) {}

  async create(data: Partial<Score>): Promise<Score> {
    const persistenceModel = ScoreMapper.toPersistence(data as Score);
    const newEntity = await this.scoresRepo.save(
      this.scoresRepo.create(persistenceModel),
    );
    return ScoreMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterScoreDto | null;
    sortOptions?: SortScoreDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Score[]> {
    const where: FindOptionsWhere<ScoreEntity> = {};
    if (filterOptions?.submissionId) {
      where.submissionId = filterOptions.submissionId;
    }
    if (filterOptions?.judgeId) {
      where.judgeId = filterOptions.judgeId;
    }

    const entities = await this.scoresRepo.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order:
        sortOptions?.reduce(
          (accumulator, sort) => ({
            ...accumulator,
            [sort.orderBy]: sort.order,
          }),
          {},
        ) || { createdAt: 'DESC' },
    });

    return entities.map((e) => ScoreMapper.toDomain(e));
  }

  async findById(id: Score['id']): Promise<Score | null> {
    const entity = await this.scoresRepo.findOne({ where: { id } });
    return entity ? ScoreMapper.toDomain(entity) : null;
  }

  async update(id: Score['id'], payload: Partial<Score>): Promise<Score | null> {
    const entity = await this.scoresRepo.findOne({ where: { id } });
    if (!entity) return null;

    const updatedEntity = await this.scoresRepo.save(
      this.scoresRepo.create({ ...entity, ...payload }),
    );
    return ScoreMapper.toDomain(updatedEntity);
  }

  async remove(id: Score['id']): Promise<void> {
    await this.scoresRepo.delete(id);
  }

  async findBySubmissionJudgeCriteria(
    submissionId: string,
    judgeId: string,
    criteriaId: string,
  ): Promise<Score | null> {
    const entity = await this.scoresRepo.findOne({
      where: { submissionId, judgeId, criteriaId },
    });
    return entity ? ScoreMapper.toDomain(entity) : null;
  }
}
