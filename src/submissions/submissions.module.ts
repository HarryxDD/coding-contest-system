import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TeamMembersInfrastructureModule } from '../team-members/infrastructure/infrastructure.module';
import { ContestsModule } from '../contests/contests.module';
import { TeamsInfrastructureModule } from '../teams/infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule, TeamMembersInfrastructureModule, ContestsModule, TeamsInfrastructureModule],
    controllers: [SubmissionsController],
    providers: [SubmissionsService],
    exports: [SubmissionsService],
})
export class SubmissionsModule { }
