import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UserSeedService } from './user/user-seed.service';
import { ContestSeedService } from './contest/contest-seed.service';
import { JudgingCriteriaSeedService } from './judging-criteria/judging-criteria-seed.service';
import { TeamSeedService } from './team/team-seed.service';
import { TeamMemberSeedService } from './team-member/team-member-seed.service';
import { SubmissionSeedService } from './submission/submission-seed.service';
import { JudgeAssignmentSeedService } from './judge-assignment/judge-assignment-seed.service';
import { ScoreSeedService } from './score/score-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(UserSeedService).run();
  await app.get(ContestSeedService).run();
  await app.get(JudgingCriteriaSeedService).run();
  await app.get(TeamSeedService).run();
  await app.get(TeamMemberSeedService).run();
  await app.get(SubmissionSeedService).run();
  await app.get(JudgeAssignmentSeedService).run();
  await app.get(ScoreSeedService).run();

  await app.close();
};

void runSeed();
