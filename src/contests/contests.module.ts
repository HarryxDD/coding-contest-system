import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';

@Module({
    imports: [InfrastructureModule],
    controllers: [ContestsController],
    providers: [ContestsService],
    exports: [ContestsService],
})
export class ContestsModule { }
