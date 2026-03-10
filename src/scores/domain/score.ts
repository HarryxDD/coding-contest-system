import { ApiProperty } from '@nestjs/swagger';

export class Score {
  @ApiProperty()
  id: string;

  @ApiProperty()
  submissionId: string;

  @ApiProperty()
  judgeId: string;

  @ApiProperty()
  criteriaId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  feedback: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
