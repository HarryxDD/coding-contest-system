import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgingCriteriaEntity } from '../../../../judging-criteria/infrastructure/persistence/relational/entities/judging-criteria.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';

@Injectable()
export class JudgingCriteriaSeedService {
  constructor(
    @InjectRepository(JudgingCriteriaEntity)
    private repository: Repository<JudgingCriteriaEntity>,
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
          contestId: contest.id,
          name: 'Innovation',
          description: 'Originality and creativity of the solution',
          maxScore: 10,
        }),
        this.repository.create({
          contestId: contest.id,
          name: 'Technical Complexity',
          description: 'Quality of code',
          maxScore: 10,
        }),
        this.repository.create({
          contestId: contest.id,
          name: 'Presentation',
          description: 'Clarity and effectiveness of the demo',
          maxScore: 10,
        }),
        this.repository.create({
          contestId: contest.id,
          name: 'Impact',
          description: 'Potential real-world impact of the solution',
          maxScore: 10,
        }),
      ]);
    }
  }
}