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

  async findOne(id: string) {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundException('Team not found');

    const members = await this.teamMemberRepo.findByTeamId(id);
    team.members = members.map((member) => ({
      id: member.id,
      userId: member.userId,
      joinedAt: member.joinedAt,
    }));
    return team;
  }

  async update(
    id: string,
    updateDto: UpdateTeamDto,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    await this.verifyCreatorOrAdmin(id, requestingUserId, isAdmin);
    return this.teamRepo.update(id, updateDto);
  }

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
      throw new ForbiddenException('You are not authorized to modify this team');
    }

    return team;
  }
}
