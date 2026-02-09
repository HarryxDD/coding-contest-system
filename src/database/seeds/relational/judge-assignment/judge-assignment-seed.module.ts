import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgeAssignmentSeedService } from './judge-assignment-seed.service';
import { JudgeAssignmentEntity } from '../../../../judge-assignments/infrastructure/persistence/relational/entities/judge-assignment.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JudgeAssignmentEntity, ContestEntity, UserEntity]),
  ],
  providers: [JudgeAssignmentSeedService],
  exports: [JudgeAssignmentSeedService],
})
export class JudgeAssignmentSeedModule {}