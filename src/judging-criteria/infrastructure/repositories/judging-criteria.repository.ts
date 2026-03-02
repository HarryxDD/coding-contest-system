import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JudgingCriteriaEntity } from '../entities/judging-criteria.entity';
import { judgingCriteriaRepository, IJudgingCriteriaRepository } from '../judging-criteria.repository';
import { IPaginationOptions } from '@/utils/types/pagination-options';

@Injectable()
export class JudgingCriteriaRelationalRepository implements IJudgingCriteriaRepository {
  constructor(
    @InjectRepository(JudgingCriteriaEntity)
    private readonly repository: Repository<JudgingCriteriaEntity>,
  ) {}

  async create(data: Partial<JudgingCriteriaEntity>): Promise<JudgingCriteriaEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<JudgingCriteriaEntity[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<JudgingCriteriaEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByContestId(contestId: string): Promise<JudgingCriteriaEntity[]> {
    return await this.repository.find({
      where: { contestId },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, payload: Partial<JudgingCriteriaEntity>): Promise<JudgingCriteriaEntity | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    Object.assign(entity, payload);
    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findManyWithPagination({
    contestId,
    paginationOptions,
  }: {
    contestId?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<JudgingCriteriaEntity[]> {
    const where: FindOptionsWhere<JudgingCriteriaEntity> = {};

    if (contestId) {
      where.contestId = contestId;
    }

    return await this.repository.find({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { name: 'ASC' },
    });
  }

  async countByContestId(contestId: string): Promise<number> {
    return await this.repository.countBy({ contestId });
  }
}
