import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ContestEntity } from '../../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('judge_assignments')
@Index(['contestId', 'judgeId'], { unique: true })
export class JudgeAssignmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'contest_id' })
  contestId: string;

  @Column({ type: 'uuid', name: 'judge_id' })
  judgeId: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => ContestEntity, { eager: false })
  @JoinColumn({ name: 'contest_id' })
  contest?: ContestEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'judge_id' })
  judge?: UserEntity;
}
