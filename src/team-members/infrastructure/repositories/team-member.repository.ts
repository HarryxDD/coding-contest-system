import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TeamMemberEntity } from '../entities/team-member.entity';
import { TeamMember } from '../../domain/team-member';
import { teamMemberRepository } from '../team-member.repository';
import { TeamMemberMapper } from '../mappers/team-member.mapper';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { FilterTeamMemberDto, SortTeamMemberDto } from '../../dto/query-team-member.dto';

@Injectable()
export class TeamMembersRelationalRepository implements teamMemberRepository {
  constructor(
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  async create(data: Partial<TeamMember>): Promise<TeamMember> {
    const persistenceModel = TeamMemberMapper.toPersistence(data as TeamMember);
    const newEntity = await this.teamMembersRepository.save(
      this.teamMembersRepository.create(persistenceModel),
    );
    return TeamMemberMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTeamMemberDto | null;
    sortOptions?: SortTeamMemberDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<TeamMember[]> {
    const where: FindOptionsWhere<TeamMemberEntity> = {};

    if (filterOptions?.teamId) {
      where.teamId = filterOptions.teamId;
    }
    if (filterOptions?.userId) {
      where.userId = filterOptions.userId;
    }

    const entities = await this.teamMembersRepository.find({
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
        ) || { joinedAt: 'ASC' },
    });

    return entities.map((member) => TeamMemberMapper.toDomain(member));
  }

  async findById(id: TeamMember['id']): Promise<TeamMember | null> {
    const entity = await this.teamMembersRepository.findOne({ where: { id } });
    return entity ? TeamMemberMapper.toDomain(entity) : null;
  }

  async findByTeamAndUser(teamId: string, userId: string): Promise<TeamMember | null> {
    const entity = await this.teamMembersRepository.findOne({
      where: { teamId, userId },
    });
    return entity ? TeamMemberMapper.toDomain(entity) : null;
  }

  async countByTeamId(teamId: string): Promise<number> {
    return this.teamMembersRepository.count({ where: { teamId } });
  }

  async findFirstMemberByTeamId(teamId: string): Promise<TeamMember | null> {
    const entity = await this.teamMembersRepository.findOne({
      where: { teamId },
      order: { joinedAt: 'ASC' },
    });
    return entity ? TeamMemberMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<TeamMember[]> {
    const entities = await this.teamMembersRepository.find({
      where: { userId },
      order: { joinedAt: 'ASC' },
    });
    return entities.map((member) => TeamMemberMapper.toDomain(member));
  }

  async remove(id: TeamMember['id']): Promise<void> {
    await this.teamMembersRepository.delete(id);
  }
}
