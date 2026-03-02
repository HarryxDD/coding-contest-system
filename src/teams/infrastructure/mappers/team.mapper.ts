import { Team } from '@/teams/domain/team';
import { TeamEntity } from '../entities/team.entity';

export class TeamMapper {
  static toDomain(raw: TeamEntity): Team {
    const domainEntity = new Team();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.contestId = raw.contestId;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Team): TeamEntity {
    const persistenceEntity = new TeamEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.contestId = domainEntity.contestId;
    return persistenceEntity;
  }
}
