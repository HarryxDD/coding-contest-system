import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PatService } from './pat.service';

@Injectable()
export class PatAuthGuard implements CanActivate {
  constructor(private readonly patService: PatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization;

    if (!header || typeof header !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, rawToken] = header.split(' ');
    if (scheme !== 'Bearer' || !rawToken) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const token = await this.patService.validateRawToken(rawToken);
    req.user = {
      id: token.userId,
      role: token.role,
      permissions: token.permissions,
      tokenId: token.id,
    };
    return true;
  }
}
