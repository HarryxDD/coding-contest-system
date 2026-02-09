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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('contests')
export class ContestEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  reward: string | null;

  @Column({ type: 'int', default: 5, name: 'max_team_size' })
  maxTeamSize: number;

  @Column({ type: 'int', nullable: true, name: 'max_teams' })
  maxTeams: number | null;

  @Column({ type: 'timestamp', name: 'start_date' })
  @Index()
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'timestamp', name: 'submission_deadline' })
  submissionDeadline: Date;

  @Column({ type: 'uuid', name: 'organizer_id' })
  @Index()
  organizerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'organizer_id' })
  organizer?: UserEntity;
}
