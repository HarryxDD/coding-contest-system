import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../infrastructure/entities/submission.entity';

export class Submission {
  @ApiProperty({ type: String, description: 'UUID of the submission' })
  id: string;

  @ApiProperty({ type: String, description: 'UUID of the team making the submission' })
  teamId: string;

  @ApiProperty({ type: String, description: 'UUID of the contest' })
  contestId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  repositoryUrl: string | null;

  @ApiProperty()
  demoUrl: string | null;

  @ApiProperty()
  videoUrl: string | null;

  @ApiProperty({ enum: StatusEnum })
  status: StatusEnum;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
