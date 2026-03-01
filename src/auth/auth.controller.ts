import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public async login(@Body() loginDto: AuthLoginDto) {
        return this.authService.validateLogin(loginDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    public async register(@Body() registerDto: AuthRegisterDto) {
        return this.authService.register(registerDto);
    }
}