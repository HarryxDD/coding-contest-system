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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { JudgingCriteriaService } from './judging-criteria.service';
import { RolesGuard } from '@/roles/roles.guard';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { CreateJudgingCriteriaDto } from './dto/create-judging-criteria.dto';
import { UpdateJudgingCriteriaDto } from './dto/update-judging-criteria.dto';
import { QueryJudgingCriteriaDto } from './dto/query-judging-criteria.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard, RolesGuard)
@ApiTags('Judging Criteria')
@Controller('contests/:contestId/criteria')
export class JudgingCriteriaController {
  constructor(private readonly judgingCriteriaService: JudgingCriteriaService) {}

  /**
   * creates judging criteria for a contest
   * @param contestId - the contest id
   * @param createJudgingCriteriaDto - the criteria details to create
   * @returns the created judging criteria
   */
  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'create judging criteria' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiBody({
    schema: {
      example: {
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Code Quality',
        description: 'evaluates readability and maintainability',
        maxScore: 50,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'judging criteria created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174052',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Code Quality',
        description: 'evaluates readability and maintainability',
        maxScore: 50,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid contest uuid or criteria payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['name must be longer than or equal to 1 characters'],
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
  create(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Body() createJudgingCriteriaDto: CreateJudgingCriteriaDto,
  ) {
    return this.judgingCriteriaService.createForContest(
      contestId,
      createJudgingCriteriaDto,
    );
  }


  /**
   * returns paginated judging criteria
   * @param queryDto - the pagination and filter options
   * @returns the paginated judging criteria list
  */
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({ summary: 'list judging criteria for a contest' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated judging criteria',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174052',
            contestId: '123e4567-e89b-12d3-a456-426614174010',
            name: 'Code Quality',
            description: 'evaluates readability and maintainability',
            maxScore: 50,
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
    @Query() queryDto: QueryJudgingCriteriaDto,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.judgingCriteriaService.findManyWithPaginationForContest(
      contestId,
      queryDto,
    );

    return infinityPagination(data, { page, limit });
  }

  /**
   * returns judging criteria by id for a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @returns the matching judging criteria
   */
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({ summary: 'get judging criteria by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'judging criteria uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns the judging criteria',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174052',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Code Quality',
        description: 'evaluates readability and maintainability',
        maxScore: 50,
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
    description: 'contest or judging criteria not found',
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
    return this.judgingCriteriaService.findOneForContest(contestId, id);
  }

  /**
   * updates judging criteria by id for a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @param updateJudgingCriteriaDto - the fields to update
   * @returns the updated judging criteria
   */
  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({ summary: 'update judging criteria by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'judging criteria uuid' })
  @ApiBody({
    schema: {
      example: {
        description: 'evaluates readability, testing, and maintainability',
        maxScore: 60,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'judging criteria updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174052',
        contestId: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Code Quality',
        description: 'evaluates readability, testing, and maintainability',
        maxScore: 60,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid or criteria payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['maxScore must not be less than 1'],
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
    description: 'contest or judging criteria not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  update(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJudgingCriteriaDto: UpdateJudgingCriteriaDto,
  ) {
    return this.judgingCriteriaService.updateForContest(
      contestId,
      id,
      updateJudgingCriteriaDto,
    );
  }

  /**
   * removes judging criteria by id for a contest
   * @param contestId - the contest id
   * @param id - the judging criteria id
   * @returns nothing
   */
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'delete judging criteria by id' })
  @ApiParam({ name: 'contestId', type: String, description: 'contest uuid' })
  @ApiParam({ name: 'id', type: String, description: 'judging criteria uuid' })
  @ApiResponse({ status: 204, description: 'judging criteria deleted successfully' })
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
    description: 'contest or judging criteria not found',
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
    return this.judgingCriteriaService.removeForContest(contestId, id);
  }
}
