import { ScoreEntity } from '../entities/score.entity';
import { Score } from '../../domain/score';

export class ScoreMapper {
  static toDomain(raw: ScoreEntity): Score {
    const domain = new Score();
    domain.id = raw.id;
    domain.submissionId = raw.submissionId;
    domain.judgeId = raw.judgeId;
    domain.criteriaId = raw.criteriaId;
    domain.score = raw.score;
    domain.feedback = raw.feedback;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toPersistence(domain: Score): ScoreEntity {
    const entity = new ScoreEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.submissionId = domain.submissionId;
    entity.judgeId = domain.judgeId;
    entity.criteriaId = domain.criteriaId;
    entity.score = domain.score;
    entity.feedback = domain.feedback;
    return entity;
  }
}
