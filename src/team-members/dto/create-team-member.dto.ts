import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'uuid-of-the-team' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  // admins can explicitly add another user; regular users always join as themselves
  @ApiPropertyOptional({ example: 'uuid-of-the-user' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
