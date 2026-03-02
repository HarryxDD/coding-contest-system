import { IPaginationOptions } from '@/utils/types/pagination-options';
import { Submission } from '../domain/submission';
import { FilterSubmissionDto, SortSubmissionDto } from '../dto/query-submission.dto';

export abstract class submissionRepository {
    abstract create(
        data: Partial<Omit<Submission, 'id' | 'submittedAt' | 'updatedAt'>>,
    ): Promise<Submission>;

    abstract findManyWithPagination({
        filterOptions,
        sortOptions,
        paginationOptions,
    }: {
        filterOptions?: FilterSubmissionDto | null;
        sortOptions?: SortSubmissionDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Submission[]>;

    abstract findById(id: Submission['id']): Promise<Submission | null>;

    abstract update(
        id: Submission['id'],
        payload: Partial<Submission>,
    ): Promise<Submission | null>;

    abstract remove(id: Submission['id']): Promise<void>;
}
