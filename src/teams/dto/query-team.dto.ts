import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Team } from '../domain/team';

export class FilterTeamDto {
  @ApiPropertyOptional({ description: 'Filter teams by contest UUID' })
  @IsOptional()
  @IsUUID()
  contestId?: string | null;

  @ApiPropertyOptional({ description: 'Search teams by name' })
  @IsOptional()
  @IsString()
  search?: string | null;
}

export class SortTeamDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof Team;

  @ApiPropertyOptional()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class QueryTeamDto {
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
    value ? plainToInstance(FilterTeamDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterTeamDto)
  filters?: FilterTeamDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortTeamDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortTeamDto)
  sort?: SortTeamDto[] | null;
}
