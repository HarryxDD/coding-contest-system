import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSeedService } from './team-seed.service';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, ContestEntity])],
  providers: [TeamSeedService],
  exports: [TeamSeedService],
})
export class TeamSeedModule {}