import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from '../../../../../roles/roles.enum';
import { EntityRelationalHelper } from '../../../../../utils/entity-helper';

@Entity({
  name: 'users',
})
export class UserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @Index()
  username: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @Index()
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.PARTICIPANT,
    nullable: false,
  })
  role: RoleEnum;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'profile_pic' })
  profilePic: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
