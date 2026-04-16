import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'list submissions for a contest' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated submissions',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174040',
            teamId: '123e4567-e89b-12d3-a456-426614174020',
            contestId: '123e4567-e89b-12d3-a456-426614174010',
            title: 'smart scoring engine',
            description: 'automated evaluation workflow',
            repositoryUrl: 'https://github.com/team-alpha/scoring-engine',
            demoUrl: 'https://team-alpha.example.com/demo',
            videoUrl: 'https://example.com/demo-video',
            status: 'submitted',
            submittedAt: '2026-01-06T10:00:00.000Z',
            updatedAt: '2026-01-06T10:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid contest uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 404, description: 'contest not found' })
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
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'get a submission by id' })
    @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
    @ApiParam({ name: 'id', type: String, description: 'submission uuid' })
    @ApiResponse({
      status: 200,
      description: 'returns the submission',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174040',
          teamId: '123e4567-e89b-12d3-a456-426614174020',
          contestId: '123e4567-e89b-12d3-a456-426614174010',
          title: 'smart scoring engine',
          description: 'automated evaluation workflow',
          repositoryUrl: 'https://github.com/team-alpha/scoring-engine',
          demoUrl: 'https://team-alpha.example.com/demo',
          videoUrl: 'https://example.com/demo-video',
          status: 'submitted',
          submittedAt: '2026-01-06T10:00:00.000Z',
          updatedAt: '2026-01-06T10:00:00.000Z',
        },
      },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 404, description: 'contest or submission not found' })
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
  @ApiOperation({ summary: 'create a submission' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiBody({
    schema: {
      example: {
        teamId: '123e4567-e89b-12d3-a456-426614174020',
        title: 'smart scoring engine',
        description: 'automated evaluation workflow',
        repositoryUrl: 'https://github.com/team-alpha/scoring-engine',
        demoUrl: 'https://team-alpha.example.com/demo',
        videoUrl: 'https://example.com/demo-video',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'submission created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174040',
        teamId: '123e4567-e89b-12d3-a456-426614174020',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        title: 'smart scoring engine',
        description: 'automated evaluation workflow',
        repositoryUrl: 'https://github.com/team-alpha/scoring-engine',
        demoUrl: 'https://team-alpha.example.com/demo',
        videoUrl: 'https://example.com/demo-video',
        status: 'submitted',
        submittedAt: '2026-01-06T10:00:00.000Z',
        updatedAt: '2026-01-06T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid contest uuid or submission payload' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, you must be a member of the team to submit' })
  @ApiResponse({ status: 404, description: 'contest or team not found' })
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
    @ApiBearerAuth()
    @UseGuards(JwtOrPatAuthGuard, RolesGuard)
    @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'update a submission by id' })
    @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
    @ApiParam({ name: 'id', type: String, description: 'submission uuid' })
    @ApiBody({
      schema: {
        example: {
          title: 'smart scoring engine v2',
          description: 'updated evaluation workflow',
          status: 'evaluated',
        },
      },
    })
    @ApiResponse({
      status: 200,
      description: 'submission updated successfully',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174040',
          teamId: '123e4567-e89b-12d3-a456-426614174020',
          contestId: '123e4567-e89b-12d3-a456-426614174010',
          title: 'smart scoring engine v2',
          description: 'updated evaluation workflow',
          repositoryUrl: 'https://github.com/team-alpha/scoring-engine',
          demoUrl: 'https://team-alpha.example.com/demo',
          videoUrl: 'https://example.com/demo-video',
          status: 'evaluated',
          submittedAt: '2026-01-06T10:00:00.000Z',
          updatedAt: '2026-01-07T10:00:00.000Z',
        },
      },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid uuid or submission payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
    @ApiResponse({ status: 403, description: 'forbidden, you are not authorized to update this submission' })
    @ApiResponse({ status: 404, description: 'contest or submission not found' })
    update(
      @Param('contestId', ParseUUIDPipe) contestId: string,
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateSubmissionDto: UpdateSubmissionDto,
      @Request() req,
    ) {
      const isAdmin = req.user.role === RoleEnum.ADMIN;
      return this.submissionsService.updateForContest(contestId, id, updateSubmissionDto, req.user.id, isAdmin);
    }

  /**
   * removes a submission by id for a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @param req - the authenticated request
   * @returns nothing
   */
  @UseGuards(JwtOrPatAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARTICIPANT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'delete a submission by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'submission uuid' })
  @ApiResponse({ status: 204, description: 'submission deleted successfully' })
  @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, you are not authorized to remove this submission' })
  @ApiResponse({ status: 404, description: 'contest or submission not found' })
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
