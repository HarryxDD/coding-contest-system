import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { teamMemberRepository } from './infrastructure/team-member.repository';
import { teamRepository } from '../teams/infrastructure/team.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { QueryTeamMemberDto } from './dto/query-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    private readonly teamMemberRepo: teamMemberRepository,
    private readonly teamRepo: teamRepository,
    private readonly contestRepo: contestRepository,
  ) {}

  /**
   * adds a user to a team
   * @param teamId - the team id
   * @param createDto - the team membership details
   * @param requestingUserId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns the created team membership
   * @throws NotFoundException - when the team or contest does not exist
   * @throws BadRequestException - when the team is already full
   * @throws ConflictException - when the user is already a member of the team
   */
  async createForTeam(
    teamId: string,
    createDto: CreateTeamMemberDto,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    const targetUserId =
      isAdmin && createDto.userId ? createDto.userId : requestingUserId;

    const team = await this.ensureTeamExists(teamId);

    const contest = await this.contestRepo.findById(team.contestId);
    if (!contest) throw new NotFoundException('contest not found');

    const memberCount = await this.teamMemberRepo.countByTeamId(team.id);
    if (memberCount >= contest.maxTeamSize) {
      throw new BadRequestException(
        `team is full - maximum size is ${contest.maxTeamSize}`,
      );
    }

    const existing = await this.teamMemberRepo.findByTeamAndUser(
      team.id,
      targetUserId,
    );
    if (existing) {
      throw new ConflictException('user is already a member of this team');
    }

    return this.teamMemberRepo.create({ teamId: team.id, userId: targetUserId });
  }

  /**
   * returns paginated members for a team
   * @param teamId - the team id
   * @param queryDto - the pagination and filter options
   * @returns the paginated team membership list
   * @throws NotFoundException - when the team does not exist
   */
  async findAllForTeam(teamId: string, queryDto: QueryTeamMemberDto) {
    await this.ensureTeamExists(teamId);

    return this.teamMemberRepo.findManyWithPagination({
      filterOptions: {
        ...queryDto.filters,
        teamId,
      },
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  /**
   * returns a team membership by id scoped to a team
   * @param teamId - the team id
   * @param id - the team membership id
   * @returns the matching team membership
   * @throws NotFoundException - when the team or membership does not exist
   */
  async findOneForTeam(teamId: string, id: string) {
    await this.ensureTeamExists(teamId);

    const member = await this.teamMemberRepo.findById(id);
    if (!member || member.teamId !== teamId) {
      throw new NotFoundException('team membership not found');
    }

    return member;
  }

  /**
   * removes a team membership by id scoped to a team
   * @param teamId - the team id
   * @param id - the team membership id
   * @param requestingUserId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns nothing
   * @throws ForbiddenException - when the requester cannot remove the membership
   */
  async removeForTeam(
    teamId: string,
    id: string,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    const membership = await this.findOneForTeam(teamId, id);

    if (!isAdmin && membership.userId !== requestingUserId) {
      throw new ForbiddenException('you are not authorized to remove this membership');
    }

    await this.teamMemberRepo.remove(id);
  }

  private async ensureTeamExists(teamId: string) {
    const team = await this.teamRepo.findById(teamId);
    if (!team) throw new NotFoundException('team not found');
    return team;
  }
}