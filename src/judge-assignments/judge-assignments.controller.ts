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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { JudgeAssignmentsService } from './judge-assignments.service';
import { RolesGuard } from '@/roles/roles.guard';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard, RolesGuard)
@ApiTags('Judge Assignments')
@Controller('contests/:contestId/judge-assignments')
export class JudgeAssignmentsController {
  constructor(private readonly judgeAssignmentsService: JudgeAssignmentsService) {}

  /**
   * creates a judge assignment for a contest
   * @param contestId - the contest id
   * @param createJudgeAssignmentDto - the assignment details to create
   * @returns the created judge assignment
   */
  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Body() createJudgeAssignmentDto: CreateJudgeAssignmentDto,
  ) {
    return this.judgeAssignmentsService.createForContest(
      contestId,
      createJudgeAssignmentDto,
    );
  }

  /**
   * returns paginated judge assignments for a contest
   * @param contestId - the contest id
   * @param queryDto - the pagination and filter options
   * @returns the paginated judge assignment list
   */
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  async findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Query() queryDto: QueryJudgeAssignmentDto,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.judgeAssignmentsService.findManyWithPaginationForContest(
      contestId,
      queryDto,
    );

    return infinityPagination(data, { page, limit });
  }

  /**
   * returns judge assignments for a specific judge within a contest
   * @param contestId - the contest id
   * @param judgeId - the judge user id
   * @returns the matching judge assignments
   */
  @Get('judge/:judgeId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  async findByJudge(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('judgeId', ParseUUIDPipe) judgeId: string,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const data = await this.judgeAssignmentsService.findByJudgeForContest(
      contestId,
      judgeId,
    );
    return infinityPagination(data, { page: 1, limit: data.length || 1 });
  }

  /**
   * returns a judge assignment by id
   * @param contestId - the contest id
   * @param id - the judge assignment id
   * @returns the matching judge assignment
   */
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.judgeAssignmentsService.findOneForContest(contestId, id);
  }

  /**
   * removes a judge assignment by id
   * @param contestId - the contest id
   * @param id - the judge assignment id
   * @returns nothing
   */
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.judgeAssignmentsService.removeForContest(contestId, id);
  }
}