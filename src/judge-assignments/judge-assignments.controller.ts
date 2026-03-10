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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JudgeAssignmentsService } from './judge-assignments.service';
import { RolesGuard } from '@/roles/roles.guard';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { CreateJudgeAssignmentDto } from './dto/create-judge-assignment.dto';
import { QueryJudgeAssignmentDto } from './dto/query-judge-assignment.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Judge Assignments')
@Controller('judge-assignments')
export class JudgeAssignmentsController {
  constructor(private readonly judgeAssignmentsService: JudgeAssignmentsService) {}

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

  @Get('contest/:contestId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judges assigned to the contest' })
  findByContest(@Param('contestId') contestId: string) {
    return this.judgeAssignmentsService.findByContest(contestId);
  }

  @Get('judge/:judgeId')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of contests the judge is assigned to' })
  findByJudge(@Param('judgeId') judgeId: string) {
    return this.judgeAssignmentsService.findByJudge(judgeId);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'List of judge assignments' })
  findAll(@Query() queryDto: QueryJudgeAssignmentDto) {
    return this.judgeAssignmentsService.findManyWithPagination(queryDto);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JUDGE, RoleEnum.PARTICIPANT)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judge assignment found' })
  @ApiResponse({ status: 404, description: 'Judge assignment not found' })
  findOne(@Param('id') id: string) {
    return this.judgeAssignmentsService.findOne(id);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ORGANIZER)
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Judge assignment removed successfully' })
  @ApiResponse({ status: 404, description: 'Judge assignment not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.judgeAssignmentsService.remove(id);
  }
}
