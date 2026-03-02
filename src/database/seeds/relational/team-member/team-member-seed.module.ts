import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberSeedService } from './team-member-seed.service';
import { TeamMemberEntity } from '../../../../team-members/infrastructure/entities/team-member.entity';
import { TeamEntity } from '../../../../teams/infrastructure/entities/team.entity';
import { UserEntity } from '../../../../users/infrastructure/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity, TeamEntity, UserEntity])],
  providers: [TeamMemberSeedService],
  exports: [TeamMemberSeedService],
})
export class TeamMemberSeedModule {}