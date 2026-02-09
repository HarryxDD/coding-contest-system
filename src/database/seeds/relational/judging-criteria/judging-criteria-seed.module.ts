import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgingCriteriaSeedService } from './judging-criteria-seed.service';
import { JudgingCriteriaEntity } from '../../../../judging-criteria/infrastructure/persistence/relational/entities/judging-criteria.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JudgingCriteriaEntity, ContestEntity])],
  providers: [JudgingCriteriaSeedService],
  exports: [JudgingCriteriaSeedService],
})
export class JudgingCriteriaSeedModule {}