import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * logs in a user with email and password
     * @param loginDto - the login credentials
     * @returns the signed token and authenticated user
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'log in a user' })
    @ApiBody({
        schema: {
            example: {
                email: 'judge@example.com',
                password: 'secret123',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'login succeeded',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token',
                user: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    username: 'judge_one',
                    email: 'judge@example.com',
                    role: 'judge',
                    profilePic: null,
                    createdAt: '2026-01-10T10:00:00.000Z',
                    updatedAt: '2026-01-10T10:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid login payload' })
    @ApiResponse({ status: 401, description: 'unauthorized, invalid email or password' })
    public async login(@Body() loginDto: AuthLoginDto) {
        return this.authService.validateLogin(loginDto);
    }

    /**
     * registers a new user account
     * @param registerDto - the registration details
     * @returns the signed token and created user
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'register a user' })
    @ApiBody({
        schema: {
            example: {
                username: 'new_participant',
                email: 'participant@example.com',
                password: 'secret123',
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'user registered successfully',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token',
                user: {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    username: 'new_participant',
                    email: 'participant@example.com',
                    role: 'participant',
                    profilePic: null,
                    createdAt: '2026-01-10T10:00:00.000Z',
                    updatedAt: '2026-01-10T10:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'bad request, invalid registration payload' })
    public async register(@Body() registerDto: AuthRegisterDto) {
        return this.authService.register(registerDto);
    }
}
