import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusEnum, SubmissionEntity } from '../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Injectable()
export class SubmissionSeedService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private repository: Repository<SubmissionEntity>,
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
  ) {}

  async run() {
  const count = await this.repository.count();

  if (!count) {
    const team = await this.teamRepository.findOne({
      select: ['id', 'contestId'],
      where: { name: 'Code Warriors' },
    });

    if (!team) {
      return;
    }

    const submission = this.repository.create({
      teamId: team.id,
      contestId: team.contestId,
      title: 'Smart City Traffic Management System',
      description:
        'An AI-powered solution for optimizing traffic flow in urban areas using real-time data analysis.',
      repositoryUrl: 'https://github.com/codewarriors/smart-traffic',
      demoUrl: 'https://smart-traffic-demo.app.com',
      videoUrl: 'https://youtube.com/watch?v=example123',
      status: StatusEnum.SUBMITTED,
    });

    await this.repository.save(submission);
  }
}

}