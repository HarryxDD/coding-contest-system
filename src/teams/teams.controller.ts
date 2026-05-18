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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'list teams' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated list of teams',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Team Alpha',
            contestId: '123e4567-e89b-12d3-a456-426614174001',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
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
  @ApiOperation({ summary: 'get a team by id' })
  @ApiParam({ name: 'id', type: String, description: 'team uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns the team',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Team Alpha',
        contestId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['id must be a UUID'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'team not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
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
  @ApiOperation({ summary: 'create a team' })
  @ApiBody({
    schema: {
      example: {
        name: 'Team Alpha',
        contestId: '123e4567-e89b-12d3-a456-426614174001',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'team created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Team Alpha',
        contestId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'forbidden, insufficient role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'contest not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
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
  @ApiOperation({ summary: 'update a team by id' })
  @ApiParam({ name: 'id', type: String, description: 'team uuid' })
  @ApiBody({
    schema: {
      example: {
        name: 'Team Beta',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'team updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Team Beta',
        contestId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['id must be a UUID'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'forbidden, not the team creator or admin',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'team not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
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
  @ApiOperation({ summary: 'delete a team by id' })
  @ApiParam({ name: 'id', type: String, description: 'team uuid' })
  @ApiResponse({ status: 204, description: 'team deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['id must be a UUID'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'forbidden, not the team creator or admin',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'team not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.teamsService.remove(id, req.user.id, isAdmin);
  }
}
