import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMemberEntity } from '../../../../team-members/infrastructure/persistence/relational/entities/team-member.entity';
import { TeamEntity } from '../../../../teams/infrastructure/persistence/relational/entities/team.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class TeamMemberSeedService {
  constructor(
    @InjectRepository(TeamMemberEntity)
    private repository: Repository<TeamMemberEntity>,
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      const team = await this.teamRepository.findOne({
        select: ['id'],
        where: { name: 'Code Warriors' },
      });

      const participant = await this.userRepository.findOne({
        select: ['id'],
        where: { role: RoleEnum.PARTICIPANT },
      });

      if (!team || !participant) {
        return;
      }

      await this.repository.save(
        this.repository.create({
          teamId: team.id,
          userId: participant.id,
        }),
      );
    }
  }
}