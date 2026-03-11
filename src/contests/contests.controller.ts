import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
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

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Query() query: QueryContestDto): Promise<InfinityPaginationResponseDto<Contest>> {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) limit = 50;

        const data = await this.contestsService.findAll(query);
        return infinityPagination(data, { page, limit });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contestsService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Post()
    create(@Body() createContestDto: CreateContestDto, @Request() req) {
        // Current user as organizer
        return this.contestsService.create(createContestDto, req.user.id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;

        return this.contestsService.update(id, updateContestDto, req.user.id, isAdmin);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;

        return this.contestsService.remove(id, req.user.id, isAdmin);
    }
}
