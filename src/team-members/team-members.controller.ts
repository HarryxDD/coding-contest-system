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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'list team members' })
  @ApiParam({ name: 'teamId', type: String, description: 'team uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated team members',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174030',
            teamId: '123e4567-e89b-12d3-a456-426614174020',
            userId: '123e4567-e89b-12d3-a456-426614174031',
            joinedAt: '2026-01-05T12:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid team uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 404, description: 'team not found' })
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
  @ApiOperation({ summary: 'get a team member by id' })
  @ApiParam({ name: 'teamId', type: String, description: 'team uuid' })
  @ApiParam({ name: 'id', type: String, description: 'team member uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns the team member',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174030',
        teamId: '123e4567-e89b-12d3-a456-426614174020',
        userId: '123e4567-e89b-12d3-a456-426614174031',
        joinedAt: '2026-01-05T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 404, description: 'team or membership not found' })
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
  @ApiOperation({ summary: 'add a team member' })
  @ApiParam({ name: 'teamId', type: String, description: 'team uuid' })
  @ApiBody({
    schema: {
      example: {
        userId: '123e4567-e89b-12d3-a456-426614174031',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'team member created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174030',
        teamId: '123e4567-e89b-12d3-a456-426614174020',
        userId: '123e4567-e89b-12d3-a456-426614174031',
        joinedAt: '2026-01-05T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid team uuid or membership payload' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, participant or admin role required' })
  @ApiResponse({ status: 404, description: 'team or contest not found' })
  @ApiResponse({ status: 409, description: 'conflict, user is already a member of this team' })
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
  @ApiOperation({ summary: 'remove a team member' })
  @ApiParam({ name: 'teamId', type: String, description: 'team uuid' })
  @ApiParam({ name: 'id', type: String, description: 'team member uuid' })
  @ApiResponse({ status: 204, description: 'team member removed successfully' })
  @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, you are not authorized to remove this membership' })
  @ApiResponse({ status: 404, description: 'team or membership not found' })
  remove(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamMembersService.removeForTeam(teamId, id, req.user.id, isAdmin);
  }
}
