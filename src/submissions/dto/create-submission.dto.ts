import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
    @ApiProperty({ description: 'UUID of the team submitting', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    teamId: string;

    @ApiProperty({ description: 'UUID of the contest', example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    @IsNotEmpty()
    contestId: string;

    @ApiProperty({ example: 'Our awesome algorithm' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'https://github.com/teamname/hackathon' })
    @IsOptional()
    @IsUrl()
    repositoryUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    demoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    videoUrl?: string;
}
