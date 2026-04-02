import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, isObservable, lastValueFrom } from 'rxjs';
import { PatService } from '@/personal-access-tokens/pat.service';

type CanActivateResult = boolean | Promise<boolean> | Observable<boolean>;

function resolveCanActivateResult(result: CanActivateResult): Promise<boolean> {
  if (typeof result === 'boolean') return Promise.resolve(result);
  if (isObservable(result)) return lastValueFrom(result);
  return result;
}

@Injectable()
export class JwtOrPatAuthGuard implements CanActivate {
  private readonly jwtGuard: CanActivate;

  constructor(private readonly patService: PatService) {
    this.jwtGuard = new (AuthGuard('jwt'))();
  }

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

    const looksLikeJwt = rawToken.split('.').length === 3;

    if (looksLikeJwt) {
      try {
        return await resolveCanActivateResult(this.jwtGuard.canActivate(context));
      } catch {
      }
    }

    try {
      const token = await this.patService.validateRawToken(rawToken);
      req.user = {
        id: token.userId,
        role: token.role,
        permissions: token.permissions,
        tokenId: token.id,
      };
      return true;
    } catch {
    }

    if (!looksLikeJwt) {
      try {
        return await resolveCanActivateResult(this.jwtGuard.canActivate(context));
      } catch {
      }
    }

    throw new UnauthorizedException('Invalid token');
  }
}
