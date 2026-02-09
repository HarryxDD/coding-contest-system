import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreEntity } from '../../../../scores/infrastructure/persistence/relational/entities/score.entity';
import { SubmissionEntity } from '../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { JudgingCriteriaEntity } from '../../../../judging-criteria/infrastructure/persistence/relational/entities/judging-criteria.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class ScoreSeedService {
  constructor(
    @InjectRepository(ScoreEntity)
    private repository: Repository<ScoreEntity>,
    @InjectRepository(SubmissionEntity)
    private submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(JudgingCriteriaEntity)
    private criteriaRepository: Repository<JudgingCriteriaEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      const submission = await this.submissionRepository.findOne({
        select: ['id', 'contest'],
        where: { title: 'Smart City Traffic Management System' },
        relations: ['contest'],
      });

      const judge = await this.userRepository.findOne({
        select: ['id'],
        where: { role: RoleEnum.JUDGE },
      });

      if (!submission || !judge) {
        return;
      }

      const criteria = await this.criteriaRepository.find({
        select: ['id', 'name', 'maxScore'],
        where: { contest: { id: submission.contest.id } },
      });

      if (criteria.length === 0) {
        return;
      }

      const scores = criteria.map((criterion) =>
        this.repository.create({
          submissionId: submission.id,
          judgeId: judge.id,
          criteriaId: criterion.id,
          score: 10,
          feedback: `Strong performance in ${criterion.name.toLowerCase()}. Nice details.`,
        }),
      );

      await this.repository.save(scores);
    }
  }
}