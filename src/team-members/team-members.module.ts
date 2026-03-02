import { Module } from '@nestjs/common';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { TeamMembersInfrastructureModule } from './infrastructure/infrastructure.module';
import { TeamsInfrastructureModule } from '../teams/infrastructure/infrastructure.module';
import { InfrastructureModule as ContestsInfrastructureModule } from '../contests/infrastructure/infrastructure.module';

@Module({
  imports: [
    TeamMembersInfrastructureModule,
    TeamsInfrastructureModule,
    ContestsInfrastructureModule,
  ],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
