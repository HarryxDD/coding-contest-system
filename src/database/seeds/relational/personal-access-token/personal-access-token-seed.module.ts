import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccessTokenSeedService } from './personal-access-token-seed.service';
import { PersonalAccessTokenEntity } from '@/personal-access-tokens/infrastructure/entities/personal-access-token.entity';
import { UserEntity } from '@/users/infrastructure/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalAccessTokenEntity, UserEntity])],
  providers: [PersonalAccessTokenSeedService],
  exports: [PersonalAccessTokenSeedService],
})
export class PersonalAccessTokenSeedModule {}
