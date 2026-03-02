import { SubmissionEntity } from '../entities/submission.entity';
import { Submission } from '../../domain/submission';

export class SubmissionMapper {
    static toDomain(raw: SubmissionEntity): Submission {
        const domainEntity = new Submission();
        domainEntity.id = raw.id;
        domainEntity.teamId = raw.teamId;
        domainEntity.contestId = raw.contestId;
        domainEntity.title = raw.title;
        domainEntity.description = raw.description;
        domainEntity.repositoryUrl = raw.repositoryUrl;
        domainEntity.demoUrl = raw.demoUrl;
        domainEntity.videoUrl = raw.videoUrl;
        domainEntity.status = raw.status;
        domainEntity.submittedAt = raw.submittedAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }

    static toPersistence(domainEntity: Submission): SubmissionEntity {
        const persistenceEntity = new SubmissionEntity();
        if (domainEntity.id) {
            persistenceEntity.id = domainEntity.id;
        }
        persistenceEntity.teamId = domainEntity.teamId;
        persistenceEntity.contestId = domainEntity.contestId;
        persistenceEntity.title = domainEntity.title;
        persistenceEntity.description = domainEntity.description;
        persistenceEntity.repositoryUrl = domainEntity.repositoryUrl;
        persistenceEntity.demoUrl = domainEntity.demoUrl;
        persistenceEntity.videoUrl = domainEntity.videoUrl;
        persistenceEntity.status = domainEntity.status;
        return persistenceEntity;
    }
}
