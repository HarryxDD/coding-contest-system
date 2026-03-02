import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { StatusEnum } from '../infrastructure/entities/submission.entity';
import { Submission } from '../domain/submission';

export class FilterSubmissionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    contestId?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    teamId?: string | null;

    @ApiPropertyOptional({ enum: StatusEnum })
    @IsOptional()
    @IsEnum(StatusEnum)
    status?: StatusEnum | null;
}

export class SortSubmissionDto {
    @ApiPropertyOptional()
    @Type(() => String)
    @IsString()
    orderBy: keyof Submission;

    @ApiPropertyOptional()
    @IsString()
    order: 'ASC' | 'DESC';
}

export class QuerySubmissionDto {
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
        value ? plainToInstance(FilterSubmissionDto, JSON.parse(value)) : undefined
    )
    @ValidateNested()
    @Type(() => FilterSubmissionDto)
    filters?: FilterSubmissionDto | null;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Transform(({ value }) =>
        value ? plainToInstance(SortSubmissionDto, JSON.parse(value)) : undefined
    )
    @ValidateNested({ each: true })
    @Type(() => SortSubmissionDto)
    sort?: SortSubmissionDto[] | null;
}
