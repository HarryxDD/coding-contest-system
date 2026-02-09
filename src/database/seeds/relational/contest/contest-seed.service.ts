import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContestEntity } from '../../../../contests/infrastructure/persistence/relational/entities/contest.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class ContestSeedService {
  constructor(
    @InjectRepository(ContestEntity)
    private repository: Repository<ContestEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      const organizer = await this.userRepository.findOne({
        select: ['id'],
        where: { role: RoleEnum.ORGANIZER },
      });

      if (!organizer) {
        return;
      }

      const now = new Date();
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 48 * 60 * 60 * 1000);
      const submissionDeadline = new Date(
        endDate.getTime() - 2 * 60 * 60 * 1000,
      );

      await this.repository.save(
        this.repository.create({
          name: 'Spring Hackathon 2026',
          description:
            'A 48-hour coding competition focused on innovative solutions for real-world problems.',
          reward: '1st place: 5000 Euro, 2nd place: 3000 Euro, 3rd place: 1000 Euro',
          maxTeamSize: 4,
          maxTeams: 50,
          startDate,
          endDate,
          submissionDeadline,
          isActive: true,
          organizerId: organizer.id,
        }),
      );

      const futureStart = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + 72 * 60 * 60 * 1000);
      const futureDeadline = new Date(
        futureEnd.getTime() - 3 * 60 * 60 * 1000,
      );

      await this.repository.save(
        this.repository.create({
          name: 'AI Innovation Challenge',
          description:
            'Build AI-powered applications that solve social challenges.',
          reward:
            'Winner receives mentorship and 10000 Euro funding for their project',
          maxTeamSize: 5,
          maxTeams: null,
          startDate: futureStart,
          endDate: futureEnd,
          submissionDeadline: futureDeadline,
          isActive: true,
          organizerId: organizer.id,
        }),
      );
    }
  }
}