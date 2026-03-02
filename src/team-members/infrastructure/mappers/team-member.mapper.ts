import { TeamMember } from '@/team-members/domain/team-member';
import { TeamMemberEntity } from '../entities/team-member.entity';

export class TeamMemberMapper {
  static toDomain(raw: TeamMemberEntity): TeamMember {
    const domainEntity = new TeamMember();
    domainEntity.id = raw.id;
    domainEntity.teamId = raw.teamId;
    domainEntity.userId = raw.userId;
    domainEntity.joinedAt = raw.joinedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: TeamMember): TeamMemberEntity {
    const persistenceEntity = new TeamMemberEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.teamId = domainEntity.teamId;
    persistenceEntity.userId = domainEntity.userId;
    return persistenceEntity;
  }
}
