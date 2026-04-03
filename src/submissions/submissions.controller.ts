import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Submission } from './domain/submission';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard)
@Controller('contests/:contestId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * returns paginated submissions for a contest
   * @param contestId - the contest id
   * @param query - the pagination and filter options
   * @returns the paginated submission list
   */
  @Get()
  async findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Query() query: QuerySubmissionDto,
  ): Promise<InfinityPaginationResponseDto<Submission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.submissionsService.findAllForContest(contestId, query);
    return infinityPagination(data, { page, limit });
  }

  /**
   * returns a submission by id for a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @returns the matching submission
   */
  @Get(':id')
  findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.submissionsService.findOneForContest(contestId, id);
  }

  /**
   * creates a submission for a contest
   * @param contestId - the contest id
   * @param createSubmissionDto - the submission details to create
   * @param req - the authenticated request
   * @returns the created submission
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.submissionsService.createForContest(
      contestId,
      createSubmissionDto,
      req.user.id,
      isAdmin,
    );
  }

  /**
   * updates a submission by id for a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @param updateSubmissionDto - the fields to update
   * @param req - the authenticated request
   * @returns the updated submission
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @Patch(':id')
  update(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.submissionsService.updateForContest(
      contestId,
      id,
      updateSubmissionDto,
      req.user.id,
      isAdmin,
    );
  }

  /**
   * removes a submission by id for a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @param req - the authenticated request
   * @returns nothing
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const isAdmin = req.user.role === RoleEnum.ADMIN;
    return this.submissionsService.removeForContest(
      contestId,
      id,
      req.user.id,
      isAdmin,
    );
  }
}