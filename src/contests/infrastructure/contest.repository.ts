import { IPaginationOptions } from "@/utils/types/pagination-options";
import { Contest } from "../domain/contest";
import { FilterContestDto, SortContestDto } from "../dto/query-contest.dto";

export abstract class contestRepository {
    abstract create(
        data: Partial<Omit<Contest, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>>,
    ): Promise<Contest>

    abstract findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterContestDto | null;
        sortOptions?: SortContestDto[] | null;
        paginationOptions: IPaginationOptions
    }): Promise<Contest[]>

    abstract findById(id: Contest['id']): Promise<Contest | null>

    abstract update(
        id: Contest['id'],
        payload: Partial<Contest>,
    ): Promise<Contest | null>

    abstract remove(id: Contest['id']): Promise<void>
}