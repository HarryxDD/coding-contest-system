import { RoleEnum } from "@/roles/roles.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { User } from "../domain/user";

export class FilterUserDto {
    @ApiPropertyOptional({ enum: RoleEnum, isArray: true })
    @IsOptional()
    roles?: RoleEnum[] | null;
}

export class SortUserDto {
    @ApiPropertyOptional()
    @Type(() => String)
    @IsString()
    orderBy: keyof User;

    @ApiPropertyOptional()
    @IsString()
    order: 'ASC' | 'DESC';
}

export class QueryUserDto {
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
        value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined
    )
    @ValidateNested()
    @Type(() => FilterUserDto)
    filters?: FilterUserDto | null;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Transform(({ value }) =>
        value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined
    )
    @ValidateNested({ each: true })
    @Type(() => SortUserDto)
    sort?: SortUserDto[] | null;
}