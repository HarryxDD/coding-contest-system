import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from './entities/team.entity';
import { teamRepository } from './team.repository';
import { TeamsRelationalRepository } from './repositories/team.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity])],
  providers: [
    {
      provide: teamRepository,
      useClass: TeamsRelationalRepository,
    },
  ],
  exports: [teamRepository],
})
export class TeamsInfrastructureModule {}
