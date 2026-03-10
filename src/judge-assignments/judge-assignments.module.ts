import { Module } from '@nestjs/common';
import { JudgeAssignmentsController } from './judge-assignments.controller';
import { JudgeAssignmentsService } from './judge-assignments.service';
import { JudgeAssignmentInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [JudgeAssignmentInfrastructureModule],
  controllers: [JudgeAssignmentsController],
  providers: [JudgeAssignmentsService],
  exports: [JudgeAssignmentsService],
})
export class JudgeAssignmentsModule {}
