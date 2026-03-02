import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContestDto {
    @ApiProperty({ example: 'Oulu Hackathon 2026' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reward?: string;

    @ApiPropertyOptional({ default: 5 })
    @IsOptional()
    @IsInt()
    maxTeamSize?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    maxTeams?: number;

    @ApiProperty({ example: '2026-12-01T00:00:00.000Z' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-12-15T00:00:00.000Z' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: '2026-12-10T00:00:00.000Z' })
    @IsDateString()
    submissionDeadline: string;
}
