import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ContestEntity } from '../entities/contest.entity';
import { Contest } from '../../domain/contest';
import { contestRepository } from '../contest.repository';
import { ContestMapper } from '../mappers/contest.mapper';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { FilterContestDto, SortContestDto } from '../../dto/query-contest.dto';

@Injectable()
export class ContestsRelationalRepository implements contestRepository {
    constructor(
        @InjectRepository(ContestEntity)
        private readonly contestsRepository: Repository<ContestEntity>,
    ) { }

    async create(data: Contest): Promise<Contest> {
        const persistenceModel = ContestMapper.toPersistence(data);
        const newEntity = await this.contestsRepository.save(
            this.contestsRepository.create(persistenceModel),
        );

        return ContestMapper.toDomain(newEntity);
    }

    async findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterContestDto | null;
        sortOptions?: SortContestDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Contest[]> {
        const where: FindOptionsWhere<ContestEntity> = {};
        if (filterOptions?.organizerId) {
            where.organizerId = filterOptions.organizerId;
        }
        if (filterOptions?.search) {
            where.name = Like(`%${filterOptions.search}%`);
        }

        const entities = await this.contestsRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where: where,
            order: sortOptions?.reduce(
                (accumulator, sort) => ({
                    ...accumulator,
                    [sort.orderBy]: sort.order,
                }),
                {}
            ) || { createdAt: 'DESC' },
        });

        return entities.map((contest) => ContestMapper.toDomain(contest));
    }

    async findById(id: Contest['id']): Promise<Contest | null> {
        const entity = await this.contestsRepository.findOne({
            where: { id: id },
        });

        return entity ? ContestMapper.toDomain(entity) : null;
    }

    async update(id: Contest['id'], payload: Partial<Contest>): Promise<Contest | null> {
        const entity = await this.contestsRepository.findOne({
            where: { id: id },
        });

        if (!entity) return null;

        const updatedEntity = await this.contestsRepository.save(
            this.contestsRepository.create({
                ...entity,
                ...payload,
            }),
        );

        return ContestMapper.toDomain(updatedEntity);
    }

    async remove(id: Contest['id']): Promise<void> {
        await this.contestsRepository.delete(id);
    }
}
