import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberSeedService } from './team-member-seed.service';
import { TeamMemberEntity } from '../../../../team-members/infrastructure/persistence/relational/entities/team-member.entity';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity, TeamEntity, UserEntity])],
  providers: [TeamMemberSeedService],
  exports: [TeamMemberSeedService],
})
export class TeamMemberSeedModule {}