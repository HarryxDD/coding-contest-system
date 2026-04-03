import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { PersonalAccessTokenEntity } from '@/personal-access-tokens/infrastructure/entities/personal-access-token.entity';
import { UserEntity } from '@/users/infrastructure/entities/user.entity';
import { RoleEnum } from '@/roles/roles.enum';

@Injectable()
export class PersonalAccessTokenSeedService {
  private readonly logger = new Logger(PersonalAccessTokenSeedService.name);

  constructor(
    @InjectRepository(PersonalAccessTokenEntity)
    private readonly patRepository: Repository<PersonalAccessTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const adminUser = await this.userRepository.findOne({
      where: { username: 'admin' },
      select: ['id', 'username', 'role'],
    });

    if (!adminUser) {
      return;
    }

    const rawToken = 'seed_admin_pat_6c7f2a2f7a9d4e7c8f8d6c1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const existing = await this.patRepository.findOne({
      where: { tokenHash },
      select: ['id'],
    });

    if (existing) {
      return;
    }

    await this.patRepository.save(
      this.patRepository.create({
        tokenHash,
        userId: adminUser.id,
        role: RoleEnum.ADMIN,
        permissions: ['*'],
        enabled: true,
        expiresAt: null,
        lastUsedAt: null,
      }),
    );

    this.logger.log(
      'Seeded admin PAT. Use in Swagger Authorize as: Bearer <token>',
    );
    this.logger.log(rawToken);
  }
}
