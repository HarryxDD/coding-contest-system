import { ApiProperty } from '@nestjs/swagger';

export class Contest {
  @ApiProperty({ type: String, description: 'UUID of the contest' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  reward: string | null;

  @ApiProperty()
  maxTeamSize: number;

  @ApiProperty()
  maxTeams: number | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  submissionDeadline: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: String, description: 'UUID of the Organizer' })
  organizerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
