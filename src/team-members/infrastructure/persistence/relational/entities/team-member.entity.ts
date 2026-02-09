import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TeamEntity } from '../../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity('team_members')
@Index(['teamId', 'userId'], { unique: true })
export class TeamMemberEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'team_id' })
  teamId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ManyToOne(() => TeamEntity, { eager: false })
  @JoinColumn({ name: 'team_id' })
  team?: TeamEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
