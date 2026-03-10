import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ description: 'uuid of the submission being scored' })
  @IsUUID()
  @IsNotEmpty()
  submissionId: string;

  @ApiProperty({ description: 'uuid of the judging criteria' })
  @IsUUID()
  @IsNotEmpty()
  criteriaId: string;

  @ApiProperty({ description: 'score value, must not exceed the criteria max_score', example: 8 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'optional feedback for the submission' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
