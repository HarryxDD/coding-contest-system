import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { TeamsModule } from '../teams/teams.module';

@Module({
    imports: [InfrastructureModule, TeamsModule],
    controllers: [ContestsController],
    providers: [ContestsService],
    exports: [ContestsService, InfrastructureModule],
})
export class ContestsModule { }