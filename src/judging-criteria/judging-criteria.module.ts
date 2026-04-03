import { Module } from '@nestjs/common';
import { JudgingCriteriaController } from './judging-criteria.controller';
import { JudgingCriteriaService } from './judging-criteria.service';
import { JudgingCriteriaInfrastructureModule } from './infrastructure/infrastructure.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [JudgingCriteriaInfrastructureModule, ContestsModule],
  controllers: [JudgingCriteriaController],
  providers: [JudgingCriteriaService],
  exports: [JudgingCriteriaService],
})
export class JudgingCriteriaModule {}
