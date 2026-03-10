import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JudgeAssignmentEntity } from '../entities/judge-assignment.entity';
import { judgeAssignmentRepository, IJudgeAssignmentRepository } from '../judge-assignment.repository';
import { IPaginationOptions } from '@/utils/types/pagination-options';

@Injectable()
export class JudgeAssignmentRelationalRepository implements IJudgeAssignmentRepository {
  constructor(
    @InjectRepository(JudgeAssignmentEntity)
    private readonly repository: Repository<JudgeAssignmentEntity>,
  ) {}

  async create(data: Partial<JudgeAssignmentEntity>): Promise<JudgeAssignmentEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<JudgeAssignmentEntity[]> {
    return await this.repository.find({
      relations: ['contest', 'judge'],
    });
  }

  async findById(id: string): Promise<JudgeAssignmentEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['contest', 'judge'],
    });
  }

  async findByContestId(contestId: string): Promise<JudgeAssignmentEntity[]> {
    return await this.repository.find({
      where: { contestId },
      relations: ['judge'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByJudgeId(judgeId: string): Promise<JudgeAssignmentEntity[]> {
    return await this.repository.find({
      where: { judgeId },
      relations: ['contest'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByContestAndJudge(contestId: string, judgeId: string): Promise<JudgeAssignmentEntity | null> {
    return await this.repository.findOne({
      where: { contestId, judgeId },
      relations: ['contest', 'judge'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findManyWithPagination({
    contestId,
    judgeId,
    paginationOptions,
  }: {
    contestId?: string;
    judgeId?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<JudgeAssignmentEntity[]> {
    const where: FindOptionsWhere<JudgeAssignmentEntity> = {};

    if (contestId) {
      where.contestId = contestId;
    }
    if (judgeId) {
      where.judgeId = judgeId;
    }

    return await this.repository.find({
      where,
      relations: ['contest', 'judge'],
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { assignedAt: 'DESC' },
    });
  }

  async countByContestId(contestId: string): Promise<number> {
    return await this.repository.countBy({ contestId });
  }
}
