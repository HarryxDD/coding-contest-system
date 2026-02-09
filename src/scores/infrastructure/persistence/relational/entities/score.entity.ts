import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SubmissionEntity } from '../../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { JudgingCriteriaEntity } from '../../../../../judging-criteria/infrastructure/persistence/relational/entities/judging-criteria.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('scores')
@Index(['submissionId', 'judgeId', 'criteriaId'], { unique: true })
export class ScoreEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'uuid', name: 'submission_id' })
  submissionId: string;

  @Column({ type: 'uuid', name: 'judge_id' })
  judgeId: string;

  @Column({ type: 'uuid', name: 'criteria_id' })
  criteriaId: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SubmissionEntity, { eager: false })
  @JoinColumn({ name: 'submission_id' })
  submission?: SubmissionEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'judge_id' })
  judge?: UserEntity;

  @ManyToOne(() => JudgingCriteriaEntity, { eager: false })
  @JoinColumn({ name: 'criteria_id' })
  criteria?: JudgingCriteriaEntity;
}
