import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContestEntity } from '../../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('judging_criteria')
export class JudgingCriteriaEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'contest_id' })
  contestId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', name: 'max_score' })
  maxScore: number;

  @ManyToOne(() => ContestEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contest_id' })
  contest?: ContestEntity;
}
