import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccessTokenEntity } from './infrastructure/entities/personal-access-token.entity';
import { PatAuthGuard } from './pat-auth.guard';
import { PatService } from './pat.service';
import { PersonalAccessTokensController } from './personal-access-tokens.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PersonalAccessTokenEntity])],
  controllers: [PersonalAccessTokensController],
  providers: [PatService, PatAuthGuard],
  exports: [PatService, PatAuthGuard, TypeOrmModule],
})
export class PersonalAccessTokensModule {}
