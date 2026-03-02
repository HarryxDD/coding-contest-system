import { IPaginationOptions } from '@/utils/types/pagination-options';
import { Team } from '../domain/team';
import { FilterTeamDto, SortTeamDto } from '../dto/query-team.dto';

export abstract class teamRepository {
  abstract create(
    data: Partial<Omit<Team, 'id' | 'createdAt'>>,
  ): Promise<Team>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTeamDto | null;
    sortOptions?: SortTeamDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Team[]>;

  abstract findById(id: Team['id']): Promise<Team | null>;

  abstract update(
    id: Team['id'],
    payload: Partial<Team>,
  ): Promise<Team | null>;

  abstract remove(id: Team['id']): Promise<void>;
}
