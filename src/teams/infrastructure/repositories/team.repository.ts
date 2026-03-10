import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { TeamEntity } from '../entities/team.entity';
import { Team } from '../../domain/team';
import { teamRepository } from '../team.repository';
import { TeamMapper } from '../mappers/team.mapper';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { FilterTeamDto, SortTeamDto } from '../../dto/query-team.dto';

@Injectable()
export class TeamsRelationalRepository implements teamRepository {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  async create(data: Partial<Team>): Promise<Team> {
    const persistenceModel = TeamMapper.toPersistence(data as Team);
    const newEntity = await this.teamsRepository.save(
      this.teamsRepository.create(persistenceModel),
    );
    return TeamMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTeamDto | null;
    sortOptions?: SortTeamDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Team[]> {
    const where: FindOptionsWhere<TeamEntity> = {};

    if (filterOptions?.contestId) {
      where.contestId = filterOptions.contestId;
    }
    if (filterOptions?.search) {
      where.name = Like(`%${filterOptions.search}%`);
    }

    const entities = await this.teamsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order:
        sortOptions?.reduce(
          (accumulator, sort) => ({
            ...accumulator,
            [sort.orderBy]: sort.order,
          }),
          {},
        ) || { createdAt: 'DESC' },
    });

    return entities.map((team) => TeamMapper.toDomain(team));
  }

  async findById(id: Team['id']): Promise<Team | null> {
    const entity = await this.teamsRepository.findOne({ where: { id } });
    return entity ? TeamMapper.toDomain(entity) : null;
  }

  async update(id: Team['id'], payload: Partial<Team>): Promise<Team | null> {
    const entity = await this.teamsRepository.findOne({ where: { id } });
    if (!entity) return null;

    const updatedEntity = await this.teamsRepository.save(
      this.teamsRepository.create({ ...entity, ...payload }),
    );
    return TeamMapper.toDomain(updatedEntity);
  }

  async remove(id: Team['id']): Promise<void> {
    await this.teamsRepository.delete(id);
  }
}
