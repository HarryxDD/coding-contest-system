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
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('teams')
export class TeamEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', name: 'contest_id' })
  @Index()
  contestId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ContestEntity, { eager: false })
  @JoinColumn({ name: 'contest_id' })
  contest?: ContestEntity;
}
