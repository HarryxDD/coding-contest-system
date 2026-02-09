import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreSeedService } from './score-seed.service';
import { ScoreEntity } from '../../../../scores/infrastructure/persistence/relational/entities/score.entity';
import { SubmissionEntity } from '../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { JudgingCriteriaEntity } from '../../../../judging-criteria/infrastructure/persistence/relational/entities/judging-criteria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScoreEntity,
      SubmissionEntity,
      UserEntity,
      JudgingCriteriaEntity,
    ]),
  ],
  providers: [ScoreSeedService],
  exports: [ScoreSeedService],
})
export class ScoreSeedModule {}