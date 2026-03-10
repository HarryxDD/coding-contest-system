import { IsString, IsNumber, IsOptional, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJudgingCriteriaDto {
  @ApiProperty({ example: 'Code Quality', minLength: 1, maxLength: 100, required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({ example: 'Evaluates code readability and best practices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50, minimum: 1, maximum: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore?: number;
}
