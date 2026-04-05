import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { QueryTeamMemberDto } from './dto/query-team-member.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { TeamMember } from './domain/team-member';

@ApiTags('Team Members')
@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard)
@Controller('teams/:teamId/members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  /**
   * returns paginated members for a team
   * @param teamId - the team id
   * @param query - the pagination and filter options
   * @returns the paginated team membership list
   */
  @Get()
  async findAll(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Query() query: QueryTeamMemberDto,
  ): Promise<InfinityPaginationResponseDto<TeamMember>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.teamMembersService.findAllForTeam(teamId, query);
    return infinityPagination(data, { page, limit });
  }

  /**
   * returns a team membership by id
   * @param teamId - the team id
   * @param id - the team membership id
   * @returns the matching team membership
   */
  @Get(':id')
  findOne(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teamMembersService.findOneForTeam(teamId, id);
  }

  /**
   * adds a member to a team
   * @param teamId - the team id
   * @param createTeamMemberDto - the team membership details
   * @param req - the authenticated request
   * @returns the created team membership
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() createTeamMemberDto: CreateTeamMemberDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamMembersService.createForTeam(
      teamId,
      createTeamMemberDto,
      req.user.id,
      isAdmin,
    );
  }

  /**
   * removes a member from a team
   * @param teamId - the team id
   * @param id - the team membership id
   * @param req - the authenticated request
   * @returns nothing
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamMembersService.removeForTeam(teamId, id, req.user.id, isAdmin);
  }
}