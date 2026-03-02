import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { submissionRepository } from './infrastructure/submission.repository';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { StatusEnum } from './infrastructure/entities/submission.entity';

@Injectable()
export class SubmissionsService {
    constructor(private readonly submissionRepository: submissionRepository) { }

    async create(createSubmissionDto: CreateSubmissionDto, userId: string) {
        // Note: In a real scenario with the Teams module finished, 
        // we would check if this userId is actually inside the teamId!
        return this.submissionRepository.create({
            ...createSubmissionDto,
            status: StatusEnum.SUBMITTED,
        });
    }

    async findAll(queryDto: QuerySubmissionDto) {
        return this.submissionRepository.findManyWithPagination({
            filterOptions: queryDto.filters,
            sortOptions: queryDto.sort,
            paginationOptions: {
                page: queryDto.page ?? 1,
                limit: queryDto.limit ?? 10,
            },
        });
    }

    async findOne(id: string) {
        const submission = await this.submissionRepository.findById(id);
        if (!submission) throw new NotFoundException('Submission not found');
        return submission;
    }

    async update(id: string, updateDto: UpdateSubmissionDto, userId: string, isAdmin: boolean) {
        const submission = await this.findOne(id);

        // Admins and the original submitter team could be the only ones to update this
        return this.submissionRepository.update(id, updateDto);
    }

    async remove(id: string, userId: string, isAdmin: boolean) {
        await this.findOne(id); // Ensure it exists before deleting
        await this.submissionRepository.remove(id);
    }
}
