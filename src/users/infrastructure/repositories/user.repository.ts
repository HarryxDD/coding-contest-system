import { Injectable } from "@nestjs/common";
import { userRepository } from "../user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { User } from "@/users/domain/user";
import { UserMapper } from "../mappers/user.mapper";
import { FilterUserDto, SortUserDto } from "@/users/dto/query-user.dto";
import { IPaginationOptions } from "@/utils/types/pagination-options";

@Injectable()
export class UsersRelationalRepository implements userRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
    ) { }

    async create(data: User): Promise<User> {
        const persistenceModel = UserMapper.toPersistence(data);
        const newEntity = await this.usersRepository.save(
            this.usersRepository.create(persistenceModel)
        )
        return UserMapper.toDomain(newEntity)
    }

    async findAll(): Promise<User[]> {
        const entities = await this.usersRepository.find();
        return entities.map((entity) => UserMapper.toDomain(entity));
    }

    async findById(id: User['id']): Promise<User | null> {
        const entity = await this.usersRepository.findOne({ where: { id } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    async findByEmail(email: User['email']): Promise<User | null> {
        if (!email) return null;
        const entity = await this.usersRepository.findOne({ where: { email } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    async findByUsername(username: User['username']): Promise<User | null> {
        if (!username) return null;
        const entity = await this.usersRepository.findOne({ where: { username } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    async update(id: User['id'], payload: Partial<User>): Promise<User | null> {
        const entity = await this.usersRepository.findOne({ where: { id } })
        if (!entity) return null;

        const updatedEntity = await this.usersRepository.save(
            this.usersRepository.create({
                ...entity,
                ...payload,
            })
        )
        return UserMapper.toDomain(updatedEntity)
    }

    async remove(id: User['id']): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterUserDto | null;
        sortOptions?: SortUserDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<User[]> {
        const where: FindOptionsWhere<UserEntity> = {}
        if (filterOptions?.roles?.length) {
            where.role = In(filterOptions.roles)
        }

        const entities = await this.usersRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where: where,
            order: sortOptions?.reduce(
                (accumulator, sort) => ({
                    ...accumulator,
                    [sort.orderBy]: sort.order,
                }),
                {}
            )
        })

        return entities.map((user) => UserMapper.toDomain(user))
    }
}