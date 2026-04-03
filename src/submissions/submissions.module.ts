import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TeamMembersInfrastructureModule } from '../team-members/infrastructure/infrastructure.module';
import { ContestsModule } from '../contests/contests.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
    imports: [InfrastructureModule, TeamMembersInfrastructureModule, ContestsModule, TeamsModule],
    controllers: [SubmissionsController],
    providers: [SubmissionsService],
})
export class SubmissionsModule { }
