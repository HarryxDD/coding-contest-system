import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Injectable()
export class TeamSeedService {
  constructor(
    @InjectRepository(TeamEntity)
    private repository: Repository<TeamEntity>,
    @InjectRepository(ContestEntity)
    private contestRepository: Repository<ContestEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      const contest = await this.contestRepository.findOne({
        select: ['id'],
        where: { name: 'Spring Hackathon 2026' },
      });

      if (!contest) {
        return;
      }

      await this.repository.save([
        this.repository.create({
          name: 'Code Warriors',
          contestId: contest.id
        }),
        this.repository.create({
          name: 'Tech Innovators',
          contestId: contest.id
        }),
        this.repository.create({
          name: 'Debug Squad',
          contestId: contest.id
        }),
      ]);
    }
  }
}