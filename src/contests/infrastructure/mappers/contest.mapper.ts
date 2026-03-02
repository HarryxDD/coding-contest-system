import { Contest } from '@/contests/domain/contest';
import { ContestEntity } from '../entities/contest.entity';

export class ContestMapper {
    static toDomain(raw: ContestEntity): Contest {
        const domainEntity = new Contest();
        domainEntity.id = raw.id;
        domainEntity.name = raw.name;
        domainEntity.description = raw.description;
        domainEntity.reward = raw.reward;
        domainEntity.maxTeamSize = raw.maxTeamSize;
        domainEntity.maxTeams = raw.maxTeams;
        domainEntity.startDate = raw.startDate;
        domainEntity.endDate = raw.endDate;
        domainEntity.submissionDeadline = raw.submissionDeadline;
        domainEntity.isActive = raw.isActive;
        domainEntity.organizerId = raw.organizerId;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }

    static toPersistence(domainEntity: Contest): ContestEntity {
        const persistenceEntity = new ContestEntity();
        if (domainEntity.id) {
            persistenceEntity.id = domainEntity.id;
        }
        persistenceEntity.name = domainEntity.name;
        persistenceEntity.description = domainEntity.description;
        persistenceEntity.reward = domainEntity.reward;
        persistenceEntity.maxTeamSize = domainEntity.maxTeamSize;
        persistenceEntity.maxTeams = domainEntity.maxTeams;
        persistenceEntity.startDate = domainEntity.startDate;
        persistenceEntity.endDate = domainEntity.endDate;
        persistenceEntity.submissionDeadline = domainEntity.submissionDeadline;
        persistenceEntity.isActive = domainEntity.isActive;
        persistenceEntity.organizerId = domainEntity.organizerId;
        return persistenceEntity;
    }
}
