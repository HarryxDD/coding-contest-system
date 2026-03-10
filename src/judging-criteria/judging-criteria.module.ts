import { Module } from '@nestjs/common';
import { JudgingCriteriaController } from './judging-criteria.controller';
import { JudgingCriteriaService } from './judging-criteria.service';
import { JudgingCriteriaInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [JudgingCriteriaInfrastructureModule],
  controllers: [JudgingCriteriaController],
  providers: [JudgingCriteriaService],
  exports: [JudgingCriteriaService],
})
export class JudgingCriteriaModule {}
