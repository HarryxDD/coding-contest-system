import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgeAssignmentEntity } from './entities/judge-assignment.entity';
import { judgeAssignmentRepository } from './judge-assignment.repository';
import { JudgeAssignmentRelationalRepository } from './repositories/judge-assignment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JudgeAssignmentEntity])],
  providers: [
    {
      provide: judgeAssignmentRepository,
      useClass: JudgeAssignmentRelationalRepository,
    },
  ],
  exports: [judgeAssignmentRepository],
})
export class JudgeAssignmentInfrastructureModule {}
