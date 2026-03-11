import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberSummary {
  @ApiProperty({ type: String, description: 'UUID of the membership record' })
  id: string;

  @ApiProperty({ type: String, description: 'UUID of the user' })
  userId: string;

  @ApiProperty()
  joinedAt: Date;
}

export class Team {
  @ApiProperty({ type: String, description: 'UUID of the team' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, description: 'UUID of the contest this team belongs to' })
  contestId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    type: () => TeamMemberSummary,
    isArray: true,
    required: false,
    description: 'Members currently registered in the team',
  })
  members?: TeamMemberSummary[];
}
