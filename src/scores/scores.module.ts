import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { ScoresInfrastructureModule } from './infrastructure/infrastructure.module';
import { InfrastructureModule as SubmissionsInfrastructureModule } from '../submissions/infrastructure/infrastructure.module';
import { JudgeAssignmentInfrastructureModule } from '../judge-assignments/infrastructure/infrastructure.module';
import { JudgingCriteriaInfrastructureModule } from '../judging-criteria/infrastructure/infrastructure.module';

@Module({
  imports: [
    ScoresInfrastructureModule,
    SubmissionsInfrastructureModule,
    JudgeAssignmentInfrastructureModule,
    JudgingCriteriaInfrastructureModule,
  ],
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService],
})
export class ScoresModule {}
