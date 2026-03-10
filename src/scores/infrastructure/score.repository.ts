import { IPaginationOptions } from '@/utils/types/pagination-options';
import { Score } from '../domain/score';
import { FilterScoreDto, SortScoreDto } from '../dto/query-score.dto';

export abstract class scoreRepository {
  abstract create(
    data: Partial<Omit<Score, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Score>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterScoreDto | null;
    sortOptions?: SortScoreDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Score[]>;

  abstract findById(id: Score['id']): Promise<Score | null>;

  abstract update(id: Score['id'], payload: Partial<Score>): Promise<Score | null>;

  abstract remove(id: Score['id']): Promise<void>;

  // checks for duplicate score from the same judge on the same criteria for a submission
  abstract findBySubmissionJudgeCriteria(
    submissionId: string,
    judgeId: string,
    criteriaId: string,
  ): Promise<Score | null>;
}
