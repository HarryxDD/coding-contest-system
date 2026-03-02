import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
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

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Query() query: QuerySubmissionDto): Promise<InfinityPaginationResponseDto<Submission>> {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) limit = 50;

        const data = await this.submissionsService.findAll(query);
        return infinityPagination(data, { page, limit });
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
        return this.submissionsService.create(createSubmissionDto, req.user.id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.submissionsService.update(id, updateSubmissionDto, req.user.id, isAdmin);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.role === RoleEnum.ADMIN;
        return this.submissionsService.remove(id, req.user.id, isAdmin);
    }
}
