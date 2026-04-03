import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { JudgeAssignmentsService } from './judge-assignments.service';
import { RolesGuard } from '@/roles/roles.guard';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';

@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard, RolesGuard)
@ApiTags('Judge Assignments')
@Controller('judge-assignments')
export class JudgeAssignmentsController {
  constructor(private readonly judgeAssignmentsService: JudgeAssignmentsService) {}

  /**
   * creates a judge assignment
   * @param createJudgeAssignmentDto - the assignment details to create
   * @returns the created judge assignment
   */
  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 201, description: 'Judge assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Judge already assigned to this contest' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJudgeAssignmentDto: CreateJudgeAssignmentDto) {
    return this.judgeAssignmentsService.create(createJudgeAssignmentDto);
  }

  /**
   * returns judge assignments for a contest
   * @param contestId - the contest id
   * @returns the contest judge assignments
   */
  @Get('contest/:contestId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judges assigned to the contest' })
  findByContest(@Param('contestId', ParseUUIDPipe) contestId: string) {
    return this.judgeAssignmentsService.findByContest(contestId);
  }

  /**
   * returns judge assignments for a judge
   * @param judgeId - the judge user id
   * @returns the judge assignments
   */
  @Get('judge/:judgeId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of contests the judge is assigned to' })
  findByJudge(@Param('judgeId', ParseUUIDPipe) judgeId: string) {
    return this.judgeAssignmentsService.findByJudge(judgeId);
  }

  /**
   * returns paginated judge assignments
   * @param queryDto - the pagination and filter options
   * @returns the paginated judge assignment list
   */
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judge assignments' })
  findAll(@Query() queryDto: QueryJudgeAssignmentDto) {
    return this.judgeAssignmentsService.findManyWithPagination(queryDto);
  }

  /**
   * returns a judge assignment by id
   * @param id - the judge assignment id
   * @returns the matching judge assignment
   */
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judge assignment found' })
  @ApiResponse({ status: 404, description: 'Judge assignment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.judgeAssignmentsService.findOne(id);
  }

  /**
   * removes a judge assignment by id
   * @param id - the judge assignment id
   * @returns nothing
   */
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 204, description: 'Judge assignment removed successfully' })
  @ApiResponse({ status: 404, description: 'Judge assignment not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.judgeAssignmentsService.remove(id);
  }
}

