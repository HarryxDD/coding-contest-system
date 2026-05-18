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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtOrPatAuthGuard } from '@/auth/jwt-or-pat-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { QueryScoreDto } from './dto/query-score.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Score } from './domain/score';

@ApiTags('Scores')
@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard)
@Controller('submissions/:submissionId/scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  /**
   * returns paginated scores for a submission
   * @param submissionId - the submission id
   * @param query - the pagination and filter options
   * @returns the paginated score list
  */
  @Get()
  @ApiOperation({ summary: 'list scores for a submission' })
  @ApiParam({ name: 'submissionId', type: String, description: 'submission uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns paginated scores',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174050',
            submissionId: '123e4567-e89b-12d3-a456-426614174040',
            judgeId: '123e4567-e89b-12d3-a456-426614174051',
            criteriaId: '123e4567-e89b-12d3-a456-426614174052',
            score: 8,
            feedback: 'strong implementation and clean structure',
            createdAt: '2026-01-08T09:00:00.000Z',
            updatedAt: '2026-01-08T09:00:00.000Z',
          },
        ],
        page: 1,
        totalItems: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid submission uuid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['submissionId must be a UUID'],
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
    status: 404,
    description: 'submission not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  async findAll(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Query() query: QueryScoreDto,
  ): Promise<InfinityPaginationResponseDto<Score>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.scoresService.findAllForSubmission(submissionId, query);
    return infinityPagination(data, { page, limit });
  }

  /**
   * returns a score by id for a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @returns the matching score
  */
  @Get(':id')
  @ApiOperation({ summary: 'get a score by id' })
  @ApiParam({ name: 'submissionId', type: String, description: 'submission uuid' })
  @ApiParam({ name: 'id', type: String, description: 'score uuid' })
  @ApiResponse({
    status: 200,
    description: 'returns the score',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174050',
        submissionId: '123e4567-e89b-12d3-a456-426614174040',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
        criteriaId: '123e4567-e89b-12d3-a456-426614174052',
        score: 8,
        feedback: 'strong implementation and clean structure',
        createdAt: '2026-01-08T09:00:00.000Z',
        updatedAt: '2026-01-08T09:00:00.000Z',
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
    status: 404,
    description: 'submission or score not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scoresService.findOneForSubmission(submissionId, id);
  }

  /**
   * creates a score for a submission
   * @param submissionId - the submission id
   * @param createScoreDto - the score details to create
   * @param req - the authenticated request
   * @returns the created score
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'create a score' })
  @ApiParam({ name: 'submissionId', type: String, description: 'submission uuid' })
  @ApiBody({
    schema: {
      example: {
        submissionId: '123e4567-e89b-12d3-a456-426614174040',
        criteriaId: '123e4567-e89b-12d3-a456-426614174052',
        score: 8,
        feedback: 'strong implementation and clean structure',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'score created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174050',
        submissionId: '123e4567-e89b-12d3-a456-426614174040',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
        criteriaId: '123e4567-e89b-12d3-a456-426614174052',
        score: 8,
        feedback: 'strong implementation and clean structure',
        createdAt: '2026-01-08T09:00:00.000Z',
        updatedAt: '2026-01-08T09:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid submission uuid or score payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['score must not be less than 0'],
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
    description: 'forbidden, you are not assigned to judge this contest',
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
    description: 'submission or judging criteria not found',
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
    description: 'conflict, score already exists for this criteria',
    schema: {
      example: {
        statusCode: 409,
        message: 'resource already exists',
        error: 'Conflict',
      },
    },
  })
  create(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() createScoreDto: CreateScoreDto,
    @Request() req,
  ) {
    return this.scoresService.createForSubmission(
      submissionId,
      createScoreDto,
      req.user.id,
    );
  }

  /**
   * updates a score by id for a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @param updateScoreDto - the fields to update
   * @param req - the authenticated request
   * @returns the updated score
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'update a score by id' })
  @ApiParam({ name: 'submissionId', type: String, description: 'submission uuid' })
  @ApiParam({ name: 'id', type: String, description: 'score uuid' })
  @ApiBody({
    schema: {
      example: {
        score: 9,
        feedback: 'improved after clarification',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'score updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174050',
        submissionId: '123e4567-e89b-12d3-a456-426614174040',
        judgeId: '123e4567-e89b-12d3-a456-426614174051',
        criteriaId: '123e4567-e89b-12d3-a456-426614174052',
        score: 9,
        feedback: 'improved after clarification',
        createdAt: '2026-01-08T09:00:00.000Z',
        updatedAt: '2026-01-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request, invalid uuid or score payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['score must not be less than 0'],
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
    description: 'forbidden, you can only update your own scores',
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
    description: 'submission or score not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  update(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScoreDto: UpdateScoreDto,
    @Request() req,
  ) {
    return this.scoresService.updateForSubmission(
      submissionId,
      id,
      updateScoreDto,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * removes a score by id for a submission
   * @param submissionId - the submission id
   * @param id - the score id
   * @param req - the authenticated request
   * @returns nothing
   */
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'delete a score by id' })
  @ApiParam({ name: 'submissionId', type: String, description: 'submission uuid' })
  @ApiParam({ name: 'id', type: String, description: 'score uuid' })
  @ApiResponse({ status: 204, description: 'score deleted successfully' })
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
    description: 'forbidden, you can only delete your own scores',
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
    description: 'submission or score not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'resource not found',
        error: 'Not Found',
      },
    },
  })
  remove(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.scoresService.removeForSubmission(
      submissionId,
      id,
      req.user.id,
      req.user.role,
    );
  }
}
