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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'create a judge assignment' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiBody({
    schema: {
      example: {
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'judge assignment created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174060',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
        assignedAt: '2026-01-08T08:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid contest uuid or assignment payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['judgeId must be a UUID'],
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
    description: 'forbidden, organizer or admin role required',
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
  @ApiResponse({
    status: 409,
    description: 'conflict, judge is already assigned to this contest',
    schema: {
      example: {
        statusCode: 409,
        message: 'resource already exists',
        error: 'Conflict',
      },
    },
  })
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
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({ summary: 'list judge assignments for a contest' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated judge assignments',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174060',
            contestId: '123e4567-e89b-12d3-a456-426614174010',
            judgeId: '123e4567-e89b-12d3-a456-426614174051',
            assignedAt: '2026-01-08T08:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid contest uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['contestId must be a UUID'],
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
    description: 'forbidden, admin, organizer, or judge role required',
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
   * @param queryDto - the pagination options
   * @returns the matching judge assignments
   */
  @Get('judge/:judgeId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({ summary: 'list judge assignments for a judge' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'judgeId', type: String, description: 'judge user uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated judge assignments for the judge',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174060',
            contestId: '123e4567-e89b-12d3-a456-426614174010',
            judgeId: '123e4567-e89b-12d3-a456-426614174051',
            assignedAt: '2026-01-08T08:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['judgeId must be a UUID'],
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
    description: 'forbidden, admin, organizer, or judge role required',
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
  async findByJudge(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('judgeId', ParseUUIDPipe) judgeId: string,
    @Query() queryDto: QueryJudgeAssignmentDto,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.judgeAssignmentsService.findByJudgeForContest(
      contestId,
      judgeId,
    );

    return infinityPagination(data, { page, limit });
  }

  /**
   * returns a judge assignment by id
   * @param contestId - the contest id
   * @param id - the judge assignment id
   * @returns the matching judge assignment
   */
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({ summary: 'get a judge assignment by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'judge assignment uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns the judge assignment',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174060',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
        assignedAt: '2026-01-08T08:00:00.000Z',
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
    description: 'forbidden, role is not allowed to view this resource',
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
    description: 'contest or judge assignment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
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
  @ApiOperation({ summary: 'delete a judge assignment by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'judge assignment uuid' })
  @ApiResponse({ status: 204, description: 'judge assignment deleted successfully' })
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
    description: 'forbidden, organizer or admin role required',
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
    description: 'contest or judge assignment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  remove(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.judgeAssignmentsService.removeForContest(contestId, id);
  }
}
