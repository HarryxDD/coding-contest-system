import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { QueryContestDto } from './dto/query-contest.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Contest } from './domain/contest';
import { QueryTeamDto } from '../teams/dto/query-team.dto';
import { Team } from '../teams/domain/team';
import { TeamsService } from '../teams/teams.service';

@ApiTags('Contests')
@Controller('contests')
export class ContestsController {
    constructor(
        private readonly contestsService: ContestsService,
        private readonly teamsService: TeamsService,
    ) { }

    /**
     * returns paginated contests
     * @param query - the pagination and filter options
     * @returns the paginated contest list
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @CacheKey('contests_list')
    @CacheTTL(300000)
    @Get()
    @ApiOperation({ summary: 'list contests' })
    @ApiResponse({
        status: 200,
        description: 'returns paginated contests',
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174010',
                        name: 'Oulu Hackathon 2026',
                        description: 'build a production ready contest platform',
                        reward: '$5000',
                        maxTeamSize: 5,
                        maxTeams: 20,
                        startDate: '2026-12-01T00:00:00.000Z',
                        endDate: '2026-12-15T00:00:00.000Z',
                        submissionDeadline: '2026-12-10T00:00:00.000Z',
                        isActive: true,
                        organizerId: '123e4567-e89b-12d3-a456-426614174011',
                        createdAt: '2026-01-01T00:00:00.000Z',
                        updatedAt: '2026-01-01T00:00:00.000Z',
                    },
                ],
                page: 1,
                totalItems: 1,
            },
        },
    })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    async findAll(@Query() query: QueryContestDto): Promise<InfinityPaginationResponseDto<Contest>> {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) limit = 50;

        const data = await this.contestsService.findAll(query);
        return infinityPagination(data, { page, limit });
    }

    /**
     * returns a contest by id
     * @param id - the contest id
     * @returns the matching contest
     */
    @Get(':id')
    @ApiOperation({ summary: 'get a contest by id' })
    @ApiParam({ name: 'id', type: String, description: 'contest uuid' })
    @ApiResponse({
        status: 200,
        description: 'returns the contest',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174010',
                name: 'Oulu Hackathon 2026',
                description: 'build a production ready contest platform',
                reward: '$5000',
                maxTeamSize: 5,
                maxTeams: 20,
                startDate: '2026-12-01T00:00:00.000Z',
                endDate: '2026-12-15T00:00:00.000Z',
                submissionDeadline: '2026-12-10T00:00:00.000Z',
                isActive: true,
                organizerId: '123e4567-e89b-12d3-a456-426614174011',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 404, description: 'contest not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.contestsService.findOne(id);
    }

    /**
     * returns paginated teams for a contest
     * @param contestId - the contest id
     * @param query - the pagination options
     * @returns the paginated team list
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @Get(':id/teams')
    @ApiOperation({ summary: 'list teams for a contest' })
    @ApiParam({ name: 'id', type: String, description: 'contest uuid' })
    @ApiResponse({
        status: 200,
        description: 'returns paginated teams for the contest',
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174020',
                        name: 'Team Alpha',
                        contestId: '123e4567-e89b-12d3-a456-426614174010',
                        createdAt: '2026-01-02T00:00:00.000Z',
                    },
                ],
                page: 1,
                totalItems: 1,
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 404, description: 'contest not found' })
    async findTeams(
        @Param('id', ParseUUIDPipe) contestId: string,
        @Query() query: QueryTeamDto,
    ): Promise<InfinityPaginationResponseDto<Team>> {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) limit = 50;

        const data = await this.teamsService.findByContestId(contestId, query);
        return infinityPagination(data, { page, limit });
    }

    /**
     * creates a contest for the authenticated organizer
     * @param createContestDto - the contest details to create
     * @param req - the authenticated request
     * @returns the created contest
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Post()
    @ApiOperation({ summary: 'create a contest' })
    @ApiBody({
        schema: {
            example: {
                name: 'Oulu Hackathon 2026',
                description: 'build a production ready contest platform',
                reward: '$5000',
                maxTeamSize: 5,
                maxTeams: 20,
                startDate: '2026-12-01T00:00:00.000Z',
                endDate: '2026-12-15T00:00:00.000Z',
                submissionDeadline: '2026-12-10T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'contest created successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174010',
                name: 'Oulu Hackathon 2026',
                description: 'build a production ready contest platform',
                reward: '$5000',
                maxTeamSize: 5,
                maxTeams: 20,
                startDate: '2026-12-01T00:00:00.000Z',
                endDate: '2026-12-15T00:00:00.000Z',
                submissionDeadline: '2026-12-10T00:00:00.000Z',
                isActive: false,
                organizerId: '123e4567-e89b-12d3-a456-426614174011',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid contest payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, organizer or admin role required' })
    create(@Body() createContestDto: CreateContestDto, @Request() req) {
        return this.contestsService.create(createContestDto, req.user.id);
    }

    /**
     * updates a contest by id
     * @param id - the contest id
     * @param updateContestDto - the fields to update
     * @param req - the authenticated request
     * @returns the updated contest
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'update a contest by id' })
    @ApiParam({ name: 'id', type: String, description: 'contest uuid' })
    @ApiBody({
        schema: {
            example: {
                description: 'updated contest scope and judging rules',
                reward: '$7500',
                submissionDeadline: '2026-12-12T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'contest updated successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174010',
                name: 'Oulu Hackathon 2026',
                description: 'updated contest scope and judging rules',
                reward: '$7500',
                maxTeamSize: 5,
                maxTeams: 20,
                startDate: '2026-12-01T00:00:00.000Z',
                endDate: '2026-12-15T00:00:00.000Z',
                submissionDeadline: '2026-12-12T00:00:00.000Z',
                isActive: true,
                organizerId: '123e4567-e89b-12d3-a456-426614174011',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-03T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid or contest payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, you are not authorized to edit this contest' })
    @ApiResponse({ status: 404, description: 'contest not found' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContestDto: UpdateContestDto, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.contestsService.update(id, updateContestDto, req.user.id, isAdmin);
    }

    /**
     * removes a contest by id
     * @param id - the contest id
     * @param req - the authenticated request
     * @returns nothing
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'delete a contest by id' })
    @ApiParam({ name: 'id', type: String, description: 'contest uuid' })
    @ApiResponse({ status: 204, description: 'contest deleted successfully' })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, you are not authorized to delete this contest' })
    @ApiResponse({ status: 404, description: 'contest not found' })
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.contestsService.remove(id, req.user.id, isAdmin);
    }
}
