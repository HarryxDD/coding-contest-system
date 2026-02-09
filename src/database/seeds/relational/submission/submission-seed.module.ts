import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionSeedService } from './submission-seed.service';
import { SubmissionEntity } from '../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionEntity, TeamEntity, ContestEntity]),
  ],
  providers: [SubmissionSeedService],
  exports: [SubmissionSeedService],
})
export class SubmissionSeedModule {}