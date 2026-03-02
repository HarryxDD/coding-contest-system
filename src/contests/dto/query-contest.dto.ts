import { ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Contest } from "../domain/contest";

export class FilterContestDto {
    @ApiPropertyOptional({ description: 'Filter by Organizer UUID' })
    @IsOptional()
    @IsString()
    organizerId?: string | null;

    @ApiPropertyOptional({ description: 'Search contests by name' })
    @IsString()
    @IsOptional()
    search?: string | null;
}

export class SortContestDto {
    @ApiPropertyOptional()
    @Type(() => String)
    @IsString()
    orderBy: keyof Contest;

    @ApiPropertyOptional()
    @IsString()
    order: 'ASC' | 'DESC';
}

export class QueryContestDto {
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
        value ? plainToInstance(FilterContestDto, JSON.parse(value)) : undefined
    )
    @ValidateNested()
    @Type(() => FilterContestDto)
    filters?: FilterContestDto | null;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Transform(({ value }) =>
        value ? plainToInstance(SortContestDto, JSON.parse(value)) : undefined
    )
    @ValidateNested({ each: true })
    @Type(() => SortContestDto)
    sort?: SortContestDto[] | null;
}