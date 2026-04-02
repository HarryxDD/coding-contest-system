import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Team } from './domain/team';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * returns paginated teams
   * @param query - the pagination and filter options
   * @returns the paginated team list
   */
  @ApiBearerAuth()
  @UseGuards(JwtOrPatAuthGuard)
  @Get()
  async findAll(
    @Query() query: QueryTeamDto,
  ): Promise<InfinityPaginationResponseDto<Team>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.teamsService.findAll(query);
    return infinityPagination(data, { page, limit });
  }

  /**
   * returns a team by id
   * @param id - the team id
   * @returns the matching team
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  /**
   * creates a team for the authenticated user
   * @param createTeamDto - the team details to create
   * @param req - the authenticated request
   * @returns the created team
   */
  @ApiBearerAuth()
  @UseGuards(JwtOrPatAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(createTeamDto, req.user.id);
  }

  /**
   * updates a team by id
   * @param id - the team id
   * @param updateTeamDto - the fields to update
   * @param req - the authenticated request
   * @returns the updated team
   */
  @ApiBearerAuth()
  @UseGuards(JwtOrPatAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamsService.update(id, updateTeamDto, req.user.id, isAdmin);
  }

  /**
   * removes a team by id
   * @param id - the team id
   * @param req - the authenticated request
   * @returns nothing
   */
  @ApiBearerAuth()
  @UseGuards(JwtOrPatAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamsService.remove(id, req.user.id, isAdmin);
  }
}

