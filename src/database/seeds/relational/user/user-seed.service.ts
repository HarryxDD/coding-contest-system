import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: RoleEnum.ADMIN,
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('admin123', salt);

      await this.repository.save(
        this.repository.create({
          username: 'admin',
          email: 'admin@example.com',
          passwordHash,
          role: RoleEnum.ADMIN,
          profilePic: null,
        }),
      );
    }

    const countOrganizer = await this.repository.count({
      where: {
        role: RoleEnum.ORGANIZER,
      },
    });

    if (!countOrganizer) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('organizer123', salt);

      await this.repository.save(
        this.repository.create({
          username: 'organizer1',
          email: 'organizer@example.com',
          passwordHash,
          role: RoleEnum.ORGANIZER,
          profilePic: null,
        }),
      );
    }

    const countJudge = await this.repository.count({
      where: {
        role: RoleEnum.JUDGE,
      },
    });

    if (!countJudge) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('judge123', salt);

      await this.repository.save(
        this.repository.create({
          username: 'judge1',
          email: 'judge@example.com',
          passwordHash,
          role: RoleEnum.JUDGE,
          profilePic: null,
        }),
      );
    }

    const countParticipant = await this.repository.count({
      where: {
        role: RoleEnum.PARTICIPANT,
      },
    });

    if (!countParticipant) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('participant123', salt);

      await this.repository.save(
        this.repository.create({
          username: 'participant1',
          email: 'participant@example.com',
          passwordHash,
          role: RoleEnum.PARTICIPANT,
          profilePic: null,
        }),
      );
    }
  }
}
