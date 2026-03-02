import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberEntity } from './entities/team-member.entity';
import { teamMemberRepository } from './team-member.repository';
import { TeamMembersRelationalRepository } from './repositories/team-member.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity])],
  providers: [
    {
      provide: teamMemberRepository,
      useClass: TeamMembersRelationalRepository,
    },
  ],
  exports: [teamMemberRepository],
})
export class TeamMembersInfrastructureModule {}
