import { RoleEnum } from '@/roles/roles.enum';
import { UserEntity } from '@/users/infrastructure/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'personal_access_tokens' })
export class PersonalAccessTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: false,
    default: RoleEnum.PARTICIPANT,
  })
  role: RoleEnum;

  @Column({ type: 'simple-array', nullable: false, default: '' })
  permissions: string[];

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_used_at',
  })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
