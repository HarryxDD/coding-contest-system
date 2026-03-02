import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service'
import { SubmissionsController } from './submissions.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    controllers: [SubmissionsController],
    providers: [SubmissionsService],
})
export class SubmissionsModule { }
