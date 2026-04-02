import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
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

@ApiBearerAuth()
@UseGuards(JwtOrPatAuthGuard, RolesGuard)
@ApiTags('Judging Criteria')
@Controller('judging-criteria')
export class JudgingCriteriaController {
  constructor(private readonly judgingCriteriaService: JudgingCriteriaService) {}

  /**
   * creates judging criteria
   * @param createJudgingCriteriaDto - the criteria details to create
   * @returns the created judging criteria
   */
  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 201, description: 'Judging criteria created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJudgingCriteriaDto: CreateJudgingCriteriaDto) {
    return this.judgingCriteriaService.create(createJudgingCriteriaDto);
  }

  /**
   * returns judging criteria for a contest
   * @param contestId - the contest id
   * @returns the contest judging criteria
   */
  @Get('contest/:contestId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judging criteria for the contest' })
  findByContest(@Param('contestId') contestId: string) {
    return this.judgingCriteriaService.findByContest(contestId);
  }

  /**
   * returns paginated judging criteria
   * @param queryDto - the pagination and filter options
   * @returns the paginated judging criteria list
   */
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judging criteria' })
  findAll(@Query() queryDto: QueryJudgingCriteriaDto) {
    return this.judgingCriteriaService.findManyWithPagination(queryDto);
  }

  /**
   * returns judging criteria by id
   * @param id - the judging criteria id
   * @returns the matching judging criteria
   */
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judging criteria found' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
  findOne(@Param('id') id: string) {
    return this.judgingCriteriaService.findOne(id);
  }

  /**
   * updates judging criteria by id
   * @param id - the judging criteria id
   * @param updateJudgingCriteriaDto - the fields to update
   * @returns the updated judging criteria
   */
  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judging criteria updated successfully' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
  update(
    @Param('id') id: string,
    @Body() updateJudgingCriteriaDto: UpdateJudgingCriteriaDto,
  ) {
    return this.judgingCriteriaService.update(id, updateJudgingCriteriaDto);
  }

  /**
   * removes judging criteria by id
   * @param id - the judging criteria id
   * @returns nothing
   */
  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 204, description: 'Judging criteria deleted successfully' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.judgingCriteriaService.remove(id);
  }
}

