import { IPaginationOptions } from '@/utils/types/pagination-options';
import { TeamMember } from '../domain/team-member';
import { FilterTeamMemberDto, SortTeamMemberDto } from '../dto/query-team-member.dto';

export abstract class teamMemberRepository {
  abstract create(
    data: Partial<Omit<TeamMember, 'id' | 'joinedAt'>>,
  ): Promise<TeamMember>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTeamMemberDto | null;
    sortOptions?: SortTeamMemberDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<TeamMember[]>;

  abstract findById(id: TeamMember['id']): Promise<TeamMember | null>;

  // check if user is already a member of the team
  abstract findByTeamAndUser(
    teamId: string,
    userId: string,
  ): Promise<TeamMember | null>;

  // used to enforce max_team_size before adding a new member
  abstract countByTeamId(teamId: string): Promise<number>;

  // returns the member who joined first — treated as the team creator
  abstract findFirstMemberByTeamId(teamId: string): Promise<TeamMember | null>;

  // returns all team memberships for a given team
  abstract findByTeamId(teamId: string): Promise<TeamMember[]>;

  // returns all team memberships for a given user
  abstract findByUserId(userId: string): Promise<TeamMember[]>;

  abstract remove(id: TeamMember['id']): Promise<void>;
}
