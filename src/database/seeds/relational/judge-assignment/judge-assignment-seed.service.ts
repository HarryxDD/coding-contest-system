import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeAssignmentEntity } from '../../../../judge-assignments/infrastructure/persistence/relational/entities/judge-assignment.entity';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class JudgeAssignmentSeedService {
  constructor(
    @InjectRepository(JudgeAssignmentEntity)
    private repository: Repository<JudgeAssignmentEntity>,
    @InjectRepository(ContestEntity)
    private contestRepository: Repository<ContestEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      const contest = await this.contestRepository.findOne({
        select: ['id'],
        where: { name: 'Spring Hackathon 2026' },
      });

      const judge = await this.userRepository.findOne({
        select: ['id'],
        where: { role: RoleEnum.JUDGE },
      });

      if (!contest || !judge) {
        return;
      }

      await this.repository.save(
        this.repository.create({
          contestId: contest.id,
          judgeId: judge.id,
        }),
      );
    }
  }
}