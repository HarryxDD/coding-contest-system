import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionSeedService } from './submission-seed.service';
import { SubmissionEntity } from '../../../../submissions/infrastructure/entities/submission.entity';
import { TeamEntity } from '../../../../teams/infrastructure/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/entities/contest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionEntity, TeamEntity, ContestEntity]),
  ],
  providers: [SubmissionSeedService],
  exports: [SubmissionSeedService],
})
export class SubmissionSeedModule {}