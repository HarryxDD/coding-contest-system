import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Contests')
@Controller('contests')
export class ContestsController {
    constructor(private readonly contestsService: ContestsService) { }

    /**
     * returns paginated contests
     * @param query - the pagination and filter options
     * @returns the paginated contest list
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @Get()
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
    findOne(@Param('id') id: string) {
        return this.contestsService.findOne(id);
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
    create(@Body() createContestDto: CreateContestDto, @Request() req) {
        // Current user as organizer
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
    update(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto, @Request() req) {
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
    remove(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;

        return this.contestsService.remove(id, req.user.id, isAdmin);
    }
}
