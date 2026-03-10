import { ApiProperty } from '@nestjs/swagger';

export class TeamMember {
  @ApiProperty({ type: String, description: 'UUID of the membership record' })
  id: string;

  @ApiProperty({ type: String, description: 'UUID of the team' })
  teamId: string;

  @ApiProperty({ type: String, description: 'UUID of the user' })
  userId: string;

  @ApiProperty()
  joinedAt: Date;
}
