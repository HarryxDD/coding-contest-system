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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judging criteria found' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
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
  remove(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.judgingCriteriaService.removeForContest(contestId, id);
  }
}