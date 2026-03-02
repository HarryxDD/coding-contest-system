import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { SubmissionEntity } from '../entities/submission.entity';
import { Submission } from '../../domain/submission';
import { submissionRepository } from '../submission.repository';
import { SubmissionMapper } from '../mappers/submission.mapper';
import { FilterSubmissionDto, SortSubmissionDto } from '../../dto/query-submission.dto';

@Injectable()
export class SubmissionsRelationalRepository implements submissionRepository {
    constructor(
        @InjectRepository(SubmissionEntity)
        private readonly submissionsRepo: Repository<SubmissionEntity>,
    ) { }

    async create(data: Submission): Promise<Submission> {
        const persistenceModel = SubmissionMapper.toPersistence(data);
        const newEntity = await this.submissionsRepo.save(
            this.submissionsRepo.create(persistenceModel),
        );
        return SubmissionMapper.toDomain(newEntity);
    }

    async findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterSubmissionDto | null;
        sortOptions?: SortSubmissionDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Submission[]> {
        const where: FindOptionsWhere<SubmissionEntity> = {};
        if (filterOptions?.contestId) {
            where.contestId = filterOptions.contestId;
        }
        if (filterOptions?.teamId) {
            where.teamId = filterOptions.teamId;
        }
        if (filterOptions?.status) {
            where.status = filterOptions.status;
        }

        const entities = await this.submissionsRepo.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where: where,
            order: sortOptions?.reduce(
                (accumulator, sort) => ({
                    ...accumulator,
                    [sort.orderBy]: sort.order,
                }),
                {},
            ) || { submittedAt: 'DESC' },
        });

        return entities.map((submission) => SubmissionMapper.toDomain(submission));
    }

    async findById(id: Submission['id']): Promise<Submission | null> {
        const entity = await this.submissionsRepo.findOne({
            where: { id: id },
        });

        return entity ? SubmissionMapper.toDomain(entity) : null;
    }

    async update(id: Submission['id'], payload: Partial<Submission>): Promise<Submission | null> {
        const entity = await this.submissionsRepo.findOne({
            where: { id: id },
        });

        if (!entity) return null;

        const updatedEntity = await this.submissionsRepo.save(
            this.submissionsRepo.create({
                ...entity,
                ...payload,
            }),
        );

        return SubmissionMapper.toDomain(updatedEntity);
    }

    async remove(id: Submission['id']): Promise<void> {
        await this.submissionsRepo.delete(id);
    }
}
