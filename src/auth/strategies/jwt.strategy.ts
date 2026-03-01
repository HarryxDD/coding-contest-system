import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('AUTH_JWT_SECRET', 'JWT_SECRET')
        })
    }

    async validate(payload: any) {
        if (!payload.id) {
            throw new UnauthorizedException()
        }

        return { id: payload.id, role: payload.role }
    }
}