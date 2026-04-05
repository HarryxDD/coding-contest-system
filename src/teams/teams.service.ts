import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { teamRepository } from './infrastructure/team.repository';
import { teamMemberRepository } from '../team-members/infrastructure/team-member.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamRepo: teamRepository,
    private readonly teamMemberRepo: teamMemberRepository,
    private readonly contestRepo: contestRepository,
  ) {}

  /**
   * creates a team and adds the creator as a member
   * @param createTeamDto - the team details to create
   * @param creatorId - the creator user id
   * @returns the created team
   * @throws NotFoundException - when the contest does not exist
   */
  async create(createTeamDto: CreateTeamDto, creatorId: string) {
    const contest = await this.contestRepo.findById(createTeamDto.contestId);
    if (!contest) throw new NotFoundException('Contest not found');

    const team = await this.teamRepo.create({
      name: createTeamDto.name,
      contestId: createTeamDto.contestId,
    });

    // the creator is automatically the first member of the team
    await this.teamMemberRepo.create({ teamId: team.id, userId: creatorId });

    return team;
  }

  /**
   * returns paginated teams
   * @param queryDto - the pagination and filter options
   * @returns the paginated team list
   */
  async findAll(queryDto: QueryTeamDto) {
    return this.teamRepo.findManyWithPagination({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  /**
   * returns paginated teams for a contest
   * @param contestId - the contest id
   * @param queryDto - the pagination options
   * @returns the paginated team list
   * @throws NotFoundException - when the contest does not exist
   */
  async findByContestId(contestId: string, queryDto: QueryTeamDto) {
    const contest = await this.contestRepo.findById(contestId);
    if (!contest) throw new NotFoundException('contest not found');

    return this.teamRepo.findByContestId(contestId, {
      page: queryDto.page ?? 1,
      limit: queryDto.limit ?? 10,
    });
  }

  /**
   * returns a team by id with members
   * @param id - the team id
   * @returns the matching team
   * @throws NotFoundException - when the team does not exist
   */
  async findOne(id: string) {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundException('team not found');

    const members = await this.teamMemberRepo.findByTeamId(id);
    team.members = members.map((member) => ({
      id: member.id,
      userId: member.userId,
      joinedAt: member.joinedAt,
    }));
    return team;
  }

  /**
   * updates a team by id
   * @param id - the team id
   * @param updateDto - the fields to update
   * @param requestingUserId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns the updated team
   * @throws ForbiddenException - when the requester is not the team creator or an admin
   */
  async update(
    id: string,
    updateDto: UpdateTeamDto,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    await this.verifyCreatorOrAdmin(id, requestingUserId, isAdmin);
    return this.teamRepo.update(id, updateDto);
  }

  /**
   * removes a team by id
   * @param id - the team id
   * @param requestingUserId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns nothing
   * @throws ForbiddenException - when the requester is not the team creator or an admin
   */
  async remove(id: string, requestingUserId: string, isAdmin: boolean) {
    await this.verifyCreatorOrAdmin(id, requestingUserId, isAdmin);
    await this.teamRepo.remove(id);
  }

  // the creator is determined as the member with the earliest joined_at
  private async verifyCreatorOrAdmin(
    teamId: string,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    const team = await this.findOne(teamId);
    if (isAdmin) return team;

    const creator = await this.teamMemberRepo.findFirstMemberByTeamId(teamId);
    if (!creator || creator.userId !== requestingUserId) {
      throw new ForbiddenException('you are not authorized to modify this team');
    }

    return team;
  }
}
