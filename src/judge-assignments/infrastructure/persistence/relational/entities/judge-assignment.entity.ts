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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'contest_id' })
  contestId: number;

  @Column({ type: 'int', name: 'judge_id' })
  judgeId: number;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => ContestEntity, { eager: false })
  @JoinColumn({ name: 'contest_id' })
  contest?: ContestEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'judge_id' })
  judge?: UserEntity;
}
