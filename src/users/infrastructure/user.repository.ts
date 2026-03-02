import { User } from "@/users/domain/user";
import { FilterUserDto, SortUserDto } from "../dto/query-user.dto";
import { IPaginationOptions } from "@/utils/types/pagination-options";

// Abstract class so NestJS can use it as an Injection Token
export abstract class userRepository {
    abstract create(
        data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<User>;

    abstract findAll(): Promise<User[]>;

    abstract findById(id: User['id']): Promise<User | null>;

    abstract findByEmail(email: User['email']): Promise<User | null>;

    abstract findByUsername(username: User['username']): Promise<User | null>;

    abstract update(id: User['id'], payload: Partial<User>): Promise<User | null>;

    abstract remove(id: User['id']): Promise<void>;

    abstract findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterUserDto | null;
        sortOptions?: SortUserDto[] | null;
        paginationOptions: IPaginationOptions
    }): Promise<User[]>;
}