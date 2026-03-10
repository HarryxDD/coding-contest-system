import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
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
@UseGuards(AuthGuard('jwt'))
@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get()
  async findAll(
    @Query() query: QueryScoreDto,
  ): Promise<InfinityPaginationResponseDto<Score>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const data = await this.scoresService.findAll(query);
    return infinityPagination(data, { page, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoresService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createScoreDto: CreateScoreDto, @Request() req) {
    return this.scoresService.create(createScoreDto, req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScoreDto: UpdateScoreDto,
    @Request() req,
  ) {
    return this.scoresService.update(id, updateScoreDto, req.user.id, req.user.role);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.JUDGE, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.scoresService.remove(id, req.user.id, req.user.role);
  }
}
