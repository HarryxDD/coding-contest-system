import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthLoginDto } from "./dto/auth-login.dto";
import * as bcrypt from 'bcryptjs';
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { RoleEnum } from "@/roles/roles.enum";
import { UserEntity } from "@/users/infrastructure/entities/user.entity";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) { }

    async validateLogin(loginDto: AuthLoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email }
        })

        if (!user) throw new UnauthorizedException('Invalid email or password');

        const isValidPassword = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isValidPassword) throw new UnauthorizedException('Invalid email or password');

        const token = this.jwtService.sign({ id: user.id, role: user.role })
        return { token, user };
    }

    async register(registerDto: AuthRegisterDto) {
        const existingUser = await this.userRepository.findOne({
            where: [{ email: registerDto.email }, { username: registerDto.username }]
        });

        if (existingUser) {
            throw new UnprocessableEntityException('Email or username already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const user = this.userRepository.create({
            email: registerDto.email,
            username: registerDto.username,
            passwordHash,
            role: registerDto.role ?? RoleEnum.PARTICIPANT
        });

        await this.userRepository.save(user);

        const token = this.jwtService.sign({ id: user.id, role: user.role });
        return { token, user };
    }
}