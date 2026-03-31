import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { PersonalAccessTokenEntity } from './infrastructure/entities/personal-access-token.entity';
import { RoleEnum } from '@/roles/roles.enum';

@Injectable()
export class PatService {
  constructor(
    @InjectRepository(PersonalAccessTokenEntity)
    private readonly patRepository: Repository<PersonalAccessTokenEntity>,
  ) {}

  allowedScopesForRole(role: RoleEnum): Set<string> {
    if (role === RoleEnum.ADMIN) return new Set(['*']);

    if (role === RoleEnum.ORGANIZER) {
      return new Set([
        'contest:read',
        'contest:write',
        'team:read',
        'team:write',
        'submission:read',
        'judging_criteria:read',
        'judging_criteria:write',
        'judge_assignment:read',
        'judge_assignment:write',
        'score:read',
      ]);
    }

    if (role === RoleEnum.JUDGE) {
      return new Set([
        'contest:read',
        'submission:read',
        'judging_criteria:read',
        'score:read',
        'score:write',
      ]);
    }

    return new Set([
      'contest:read',
      'team:read',
      'team:write',
      'submission:read',
      'submission:write',
      'score:read',
    ]);
  }

  async createForUser(params: {
    userId: string;
    role: RoleEnum;
    permissions: string[];
    expiresAt?: Date | null;
  }): Promise<{ token: string; record: PersonalAccessTokenEntity }> {
    const allowed = this.allowedScopesForRole(params.role);
    const requested = (params.permissions ?? []).map((p) => p.trim()).filter(Boolean);

    if (params.role !== RoleEnum.ADMIN) {
      for (const scope of requested) {
        if (!allowed.has(scope)) {
          throw new ForbiddenException('Requested permissions not allowed');
        }
      }
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const record = await this.patRepository.save(
      this.patRepository.create({
        tokenHash,
        userId: params.userId,
        role: params.role,
        permissions: params.role === RoleEnum.ADMIN && requested.length === 0 ? ['*'] : requested,
        enabled: true,
        expiresAt: params.expiresAt ?? null,
        lastUsedAt: null,
      }),
    );

    return { token: rawToken, record };
  }

  async listForUser(userId: string): Promise<PersonalAccessTokenEntity[]> {
    return this.patRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeForUser(params: {
    tokenId: string;
    requesterUserId: string;
    requesterRole: RoleEnum;
  }): Promise<void> {
    const token = await this.patRepository.findOne({ where: { id: params.tokenId } });
    if (!token) return;

    const isOwner = token.userId === params.requesterUserId;
    const isAdmin = params.requesterRole === RoleEnum.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not allowed');
    }

    await this.patRepository.update(token.id, { enabled: false });
  }

  async validateRawToken(rawToken: string): Promise<PersonalAccessTokenEntity> {
    if (!rawToken) {
      throw new UnauthorizedException('Missing token');
    }

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const token = await this.patRepository.findOne({
      where: {
        tokenHash,
        enabled: true,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    if (token.expiresAt && token.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    await this.patRepository.update(token.id, { lastUsedAt: new Date() });
    return token;
  }
}
