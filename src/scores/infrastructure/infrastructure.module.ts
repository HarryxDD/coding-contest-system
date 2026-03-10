import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreEntity } from './entities/score.entity';
import { scoreRepository } from './score.repository';
import { ScoresRelationalRepository } from './repositories/score.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreEntity])],
  providers: [
    {
      provide: scoreRepository,
      useClass: ScoresRelationalRepository,
    },
  ],
  exports: [scoreRepository],
})
export class ScoresInfrastructureModule {}
