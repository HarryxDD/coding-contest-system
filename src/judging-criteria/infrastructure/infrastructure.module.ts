import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgingCriteriaEntity } from './entities/judging-criteria.entity';
import { judgingCriteriaRepository } from './judging-criteria.repository';
import { JudgingCriteriaRelationalRepository } from './repositories/judging-criteria.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JudgingCriteriaEntity])],
  providers: [
    {
      provide: judgingCriteriaRepository,
      useClass: JudgingCriteriaRelationalRepository,
    },
  ],
  exports: [judgingCriteriaRepository],
})
export class JudgingCriteriaInfrastructureModule {}
