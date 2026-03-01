import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgeAssignmentSeedService } from './judge-assignment-seed.service';
import { JudgeAssignmentEntity } from '../../../../judge-assignments/infrastructure/entities/judge-assignment.entity';
import { ContestEntity } from '../../../../contests/infrastructure/entities/contest.entity';
import { UserEntity } from '../../../../users/infrastructure/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JudgeAssignmentEntity, ContestEntity, UserEntity]),
  ],
  providers: [JudgeAssignmentSeedService],
  exports: [JudgeAssignmentSeedService],
})
export class JudgeAssignmentSeedModule {}