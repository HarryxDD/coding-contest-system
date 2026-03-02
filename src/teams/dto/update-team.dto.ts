import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// only the name can change — a team cannot be reassigned to a different contest
export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Team Beta' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
