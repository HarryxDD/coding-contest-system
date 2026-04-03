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

    /**
     * creates a new user record
     * @param createDto - the user details to store
     * @returns the created user
     * @throws UnprocessableEntityException - when the email or username already exists
     */
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

    /**
     * returns all users
     * @returns the full user list
     */
    async findAll() {
        return this.userRepository.findAll()
    }

    /**
     * returns paginated users
     * @param queryDto - the pagination and filter options
     * @returns the paginated user list
     */
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

    /**
     * returns a user by id
     * @param id - the user id
     * @returns the matching user
     * @throws NotFoundException - when the user does not exist
     */
    async findOne(id: string) {
        const user = await this.userRepository.findById(id)
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    /**
     * updates a user record
     * @param id - the user id
     * @param updateDto - the fields to update
     * @returns the updated user
     * @throws NotFoundException - when the user does not exist
     */
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

    /**
     * removes a user by id
     * @param id - the user id
     * @returns the removal result
     */
    async remove(id: string) {
        return this.userRepository.remove(id)
    }
}
