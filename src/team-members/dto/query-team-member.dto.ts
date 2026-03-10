import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TeamMember } from '../domain/team-member';

const parseQueryValue = <T>(value: unknown, dto: new () => T) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return plainToInstance(dto, JSON.parse(value));
  }

  return plainToInstance(dto, value);
};

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
  @Transform(({ value }) => parseQueryValue(value, FilterTeamMemberDto))
  @ValidateNested()
  @Type(() => FilterTeamMemberDto)
  filters?: FilterTeamMemberDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => parseQueryValue(value, SortTeamMemberDto))
  @ValidateNested({ each: true })
  @Type(() => SortTeamMemberDto)
  sort?: SortTeamMemberDto[] | null;
}
