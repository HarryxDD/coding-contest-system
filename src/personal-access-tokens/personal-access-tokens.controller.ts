import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PatService } from './pat.service';
import { CreatePatDto } from './pat.dto';

@ApiTags('PAT')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pat')
export class PersonalAccessTokensController {
  constructor(private readonly patService: PatService) {}

  @Post()
  async create(@Body() dto: CreatePatDto, @Request() req) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    const { token, record } = await this.patService.createForUser({
      userId: req.user.id,
      role: req.user.role,
      permissions: dto.permissions,
      expiresAt,
    });

    return {
      token,
      id: record.id,
      enabled: record.enabled,
      permissions: record.permissions,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    };
  }

  @Get()
  async list(@Request() req) {
    const rows = await this.patService.listForUser(req.user.id);
    return rows.map((t) => ({
      id: t.id,
      enabled: t.enabled,
      role: t.role,
      permissions: t.permissions,
      expiresAt: t.expiresAt,
      lastUsedAt: t.lastUsedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.patService.revokeForUser({
      tokenId: id,
      requesterUserId: req.user.id,
      requesterRole: req.user.role,
    });
  }
}
