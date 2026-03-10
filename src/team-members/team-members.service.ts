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

  async create(
    createDto: CreateTeamMemberDto,
    requestingUserId: string,
    isAdmin: boolean,
  ) {
    // admins can add any user; everyone else can only add themselves
    const targetUserId =
      isAdmin && createDto.userId ? createDto.userId : requestingUserId;

    const team = await this.teamRepo.findById(createDto.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const contest = await this.contestRepo.findById(team.contestId);
    if (!contest) throw new NotFoundException('Contest not found');

    const memberCount = await this.teamMemberRepo.countByTeamId(team.id);
    if (memberCount >= contest.maxTeamSize) {
      throw new BadRequestException(
        `Team is full — maximum size is ${contest.maxTeamSize}`,
      );
    }

    const existing = await this.teamMemberRepo.findByTeamAndUser(
      team.id,
      targetUserId,
    );
    if (existing) {
      throw new ConflictException('User is already a member of this team');
    }

    return this.teamMemberRepo.create({ teamId: team.id, userId: targetUserId });
  }

  async findAll(queryDto: QueryTeamMemberDto) {
    return this.teamMemberRepo.findManyWithPagination({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  async findOne(id: string) {
    const member = await this.teamMemberRepo.findById(id);
    if (!member) throw new NotFoundException('Team membership not found');
    return member;
  }

  async remove(id: string, requestingUserId: string, isAdmin: boolean) {
    const membership = await this.findOne(id);

    if (!isAdmin && membership.userId !== requestingUserId) {
      throw new ForbiddenException(
        'You are not authorized to remove this membership',
      );
    }

    await this.teamMemberRepo.remove(id);
  }
}
