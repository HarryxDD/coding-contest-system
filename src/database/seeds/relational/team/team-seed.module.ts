import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSeedService } from './team-seed.service';
import { TeamEntity } from '../../../../teams/infrastructure/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/entities/contest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, ContestEntity])],
  providers: [TeamSeedService],
  exports: [TeamSeedService],
})
export class TeamSeedModule {}