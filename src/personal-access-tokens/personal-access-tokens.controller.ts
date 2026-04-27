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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PatService } from './pat.service';
import { CreatePatDto } from './pat.dto';

@ApiTags('PAT')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pat')
export class PersonalAccessTokensController {
  constructor(private readonly patService: PatService) {}

  /**
   * creates a personal access token for the authenticated user
   * @param dto - the token settings
   * @param req - the authenticated request
   * @returns the raw token and saved token metadata
  */
  @Post()
  @ApiOperation({ summary: 'create a personal access token' })
  @ApiBody({
    schema: {
      example: {
        permissions: ['contest:read', 'submission:write'],
        expiresAt: '2026-12-31T23:59:59.000Z',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'personal access token created successfully',
    schema: {
      example: {
        token: '4b41204177b047b49a3b25012b77858d3c7de99953a12e9bc5c6e8f8e1b0a0f1',
        id: '123e4567-e89b-12d3-a456-426614174070',
        enabled: true,
        permissions: ['contest:read', 'submission:write'],
        expiresAt: '2026-12-31T23:59:59.000Z',
        createdAt: '2026-01-09T09:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'bad request, invalid token payload' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, requested permissions not allowed' })
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

  /**
   * returns personal access tokens for the authenticated user
   * @param req - the authenticated request
   * @returns the user's token metadata list
  */
  @Get()
  @ApiOperation({ summary: 'list personal access tokens' })
  @ApiResponse({
    status: 200,
    description: 'returns personal access tokens for the authenticated user',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174070',
          enabled: true,
          role: 'participant',
          permissions: ['contest:read', 'submission:write'],
          expiresAt: '2026-12-31T23:59:59.000Z',
          lastUsedAt: '2026-01-10T09:00:00.000Z',
          createdAt: '2026-01-09T09:00:00.000Z',
          updatedAt: '2026-01-10T09:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
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

  /**
   * revokes a personal access token
   * @param id - the token id
   * @param req - the authenticated request
   * @returns nothing
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'revoke a personal access token' })
  @ApiParam({ name: 'id', type: String, description: 'personal access token uuid' })
  @ApiResponse({ status: 204, description: 'personal access token revoked successfully' })
  @ApiResponse({ status: 400, description: 'bad request, invalid uuid format' })
  @ApiResponse({ status: 401, description: 'unauthorized, missing or invalid token' })
  @ApiResponse({ status: 403, description: 'forbidden, only the token owner or an admin can revoke it' })
  async revoke(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.patService.revokeForUser({
      tokenId: id,
      requesterUserId: req.user.id,
      requesterRole: req.user.role,
    });
  }
}
