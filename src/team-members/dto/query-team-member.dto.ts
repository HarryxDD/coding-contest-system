import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TeamMember } from '../domain/team-member';

export class FilterTeamMemberDto {
  @ApiPropertyOptional({ description: 'Filter members by team UUID' })
  @IsOptional()
  @IsUUID()
  teamId?: string | null;

  @ApiPropertyOptional({ description: 'Filter memberships by user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string | null;
}

export class SortTeamMemberDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof TeamMember;

  @ApiPropertyOptional()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class QueryTeamMemberDto {
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
    value ? plainToInstance(FilterTeamMemberDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterTeamMemberDto)
  filters?: FilterTeamMemberDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortTeamMemberDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortTeamMemberDto)
  sort?: SortTeamMemberDto[] | null;
}
