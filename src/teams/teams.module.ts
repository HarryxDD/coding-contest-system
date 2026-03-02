import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamsInfrastructureModule } from './infrastructure/infrastructure.module';
import { TeamMembersInfrastructureModule } from '../team-members/infrastructure/infrastructure.module';
import { InfrastructureModule as ContestsInfrastructureModule } from '../contests/infrastructure/infrastructure.module';

@Module({
  imports: [
    TeamsInfrastructureModule,
    TeamMembersInfrastructureModule,
    ContestsInfrastructureModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
