import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJudgingCriteriaDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  contestId: string;

  @ApiProperty({ example: 'Code Quality', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'Evaluates code readability and best practices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50, minimum: 1, maximum: 1000 })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore: number;
}
