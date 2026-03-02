import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { userRepository } from "./infrastructure/user.repository";
import * as bcrypt from 'bcryptjs'
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: userRepository
    ) { }

    async create(createDto: CreateUserDto) {
        const existingEmail = await this.userRepository.findByEmail(createDto.email)
        const existingUsername = await this.userRepository.findByUsername(createDto.username)

        if (existingEmail || existingUsername) {
            throw new UnprocessableEntityException('Email or username already exists')
        }

        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(createDto.password, salt)

        return this.userRepository.create({
            username: createDto.username,
            email: createDto.email,
            passwordHash: passwordHash,
            role: createDto.role,
            profilePic: null,
        })
    }

    async findAll() {
        return this.userRepository.findAll()
    }

    async findManyWithPagination(queryDto: QueryUserDto) {
        return this.userRepository.findManyWithPagination({
            filterOptions: queryDto.filters,
            sortOptions: queryDto.sort,
            paginationOptions: {
                page: queryDto.page ?? 1,
                limit: queryDto.limit ?? 10,
            }
        })
    }

    async findOne(id: string) {
        const user = await this.userRepository.findById(id)
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    async update(id: string, updateDto: UpdateUserDto) {
        const user = await this.userRepository.findById(id)
        if (!user) throw new NotFoundException('User not found')

        let passwordHash = user.passwordHash;
        if (updateDto.password) {
            const salt = await bcrypt.genSalt()
            passwordHash = await bcrypt.hash(updateDto.password, salt)
        }

        return this.userRepository.update(id, {
            username: updateDto.username ?? user.username,
            email: updateDto.email ?? user.email,
            role: updateDto.role ?? user.role,
            passwordHash: passwordHash,
        })
    }

    async remove(id: string) {
        return this.userRepository.remove(id)
    }
}