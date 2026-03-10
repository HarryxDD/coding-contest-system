import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Score } from '../domain/score';

export class FilterScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  submissionId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  judgeId?: string | null;
}

export class SortScoreDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof Score;

  @ApiPropertyOptional()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class QueryScoreDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterScoreDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterScoreDto)
  filters?: FilterScoreDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortScoreDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortScoreDto)
  sort?: SortScoreDto[] | null;
}
