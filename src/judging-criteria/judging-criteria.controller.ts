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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JudgingCriteriaService } from './judging-criteria.service';
import { RolesGuard } from '@/roles/roles.guard';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { CreateJudgingCriteriaDto } from './dto/create-judging-criteria.dto';
import { UpdateJudgingCriteriaDto } from './dto/update-judging-criteria.dto';
import { QueryJudgingCriteriaDto } from './dto/query-judging-criteria.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Judging Criteria')
@Controller('judging-criteria')
export class JudgingCriteriaController {
  constructor(private readonly judgingCriteriaService: JudgingCriteriaService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 201, description: 'Judging criteria created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJudgingCriteriaDto: CreateJudgingCriteriaDto) {
    return this.judgingCriteriaService.create(createJudgingCriteriaDto);
  }

  @Get('contest/:contestId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judging criteria for the contest' })
  findByContest(@Param('contestId') contestId: string) {
    return this.judgingCriteriaService.findByContest(contestId);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judging criteria' })
  findAll(@Query() queryDto: QueryJudgingCriteriaDto) {
    return this.judgingCriteriaService.findManyWithPagination(queryDto);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judging criteria found' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
  findOne(@Param('id') id: string) {
    return this.judgingCriteriaService.findOne(id);
  }

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

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judging criteria deleted successfully' })
  @ApiResponse({ status: 404, description: 'Judging criteria not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.judgingCriteriaService.remove(id);
  }
}
