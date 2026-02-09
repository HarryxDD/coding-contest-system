import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestSeedService } from './contest-seed.service';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContestEntity, UserEntity])],
  providers: [ContestSeedService],
  exports: [ContestSeedService],
})
export class ContestSeedModule {}