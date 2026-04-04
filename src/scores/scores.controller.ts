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