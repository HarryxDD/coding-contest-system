import { ApiProperty } from '@nestjs/swagger';

export class Team {
  @ApiProperty({ type: String, description: 'UUID of the team' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, description: 'UUID of the contest this team belongs to' })
  contestId: string;

  @ApiProperty()
  createdAt: Date;
}
