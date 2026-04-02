import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Submission } from './domain/submission';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    /**
     * returns paginated submissions
     * @param query - the pagination and filter options
     * @returns the paginated submission list
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @Get()
    async findAll(@Query() query: QuerySubmissionDto): Promise<InfinityPaginationResponseDto<Submission>> {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) limit = 50;

        const data = await this.submissionsService.findAll(query);
        return infinityPagination(data, { page, limit });
    }

    /**
     * returns a submission by id
     * @param id - the submission id
     * @returns the matching submission
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }

    /**
     * creates a submission
     * @param createSubmissionDto - the submission details to create
     * @param req - the authenticated request
     * @returns the created submission
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.submissionsService.create(createSubmissionDto, req.user.id, isAdmin);
    }

    /**
     * updates a submission by id
     * @param id - the submission id
     * @param updateSubmissionDto - the fields to update
     * @param req - the authenticated request
     * @returns the updated submission
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.submissionsService.update(id, updateSubmissionDto, req.user.id, isAdmin);
    }

    /**
     * removes a submission by id
     * @param id - the submission id
     * @param req - the authenticated request
     * @returns nothing
     */
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.submissionsService.remove(id, req.user.id, isAdmin);
    }
}

