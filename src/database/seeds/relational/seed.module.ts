import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../../typeorm-config.service';
import databaseConfig from '../../config/database.config';
import appConfig from '../../../config/app.config';
import { UserSeedModule } from './user/user-seed.module';
import { ContestSeedModule } from './contest/contest-seed.module';
import { JudgingCriteriaSeedModule } from './judging-criteria/judging-criteria-seed.module';
import { TeamSeedModule } from './team/team-seed.module';
import { TeamMemberSeedModule } from './team-member/team-member-seed.module';
import { SubmissionSeedModule } from './submission/submission-seed.module';
import { JudgeAssignmentSeedModule } from './judge-assignment/judge-assignment-seed.module';
import { ScoreSeedModule } from './score/score-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    UserSeedModule,
    ContestSeedModule,
    JudgingCriteriaSeedModule,
    TeamSeedModule,
    TeamMemberSeedModule,
    SubmissionSeedModule,
    JudgeAssignmentSeedModule,
    ScoreSeedModule,
  ],
})
export class SeedModule {}