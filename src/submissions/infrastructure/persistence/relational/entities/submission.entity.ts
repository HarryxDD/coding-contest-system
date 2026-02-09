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
import { TeamEntity } from '../../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { ContestEntity } from '../../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('submissions')
export class SubmissionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'team_id' })
  @Index()
  teamId: number;

  @Column({ type: 'int', name: 'contest_id' })
  @Index()
  contestId: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'repository_url',
  })
  repositoryUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'demo_url' })
  demoUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'video_url' })
  videoUrl: string | null;

  @CreateDateColumn({ name: 'submitted_at' })
  @Index()
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TeamEntity, { eager: false })
  @JoinColumn({ name: 'team_id' })
  team?: TeamEntity;

  @ManyToOne(() => ContestEntity, { eager: false })
  @JoinColumn({ name: 'contest_id' })
  contest?: ContestEntity;
}
