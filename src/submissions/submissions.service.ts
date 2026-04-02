import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { submissionRepository } from './infrastructure/submission.repository';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { StatusEnum } from './infrastructure/entities/submission.entity';
import { teamMemberRepository } from '../team-members/infrastructure/team-member.repository';

@Injectable()
export class SubmissionsService {
    constructor(
        private readonly submissionRepository: submissionRepository,
        private readonly teamMemberRepo: teamMemberRepository
    ) { }

    /**
     * creates a submission for a team
     * @param createSubmissionDto - the submission details to create
     * @param userId - the user making the request
     * @param isAdmin - whether the requester is an admin
     * @returns the created submission
     * @throws ForbiddenException - when the requester is not allowed to submit for the team
     */
    async create(createSubmissionDto: CreateSubmissionDto, userId: string, isAdmin: boolean) {
        if (!isAdmin) {
            const isMember = await this.teamMemberRepo.findByTeamAndUser(createSubmissionDto.teamId, userId);
            if (!isMember) {
                throw new ForbiddenException('You must be a member of the team to create a submission for it');
            }
        }
        
        return this.submissionRepository.create({
            ...createSubmissionDto,
            status: StatusEnum.SUBMITTED,
        });
    }

    /**
     * returns paginated submissions
     * @param queryDto - the pagination and filter options
     * @returns the paginated submission list
     */
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

    /**
     * returns a submission by id
     * @param id - the submission id
     * @returns the matching submission
     * @throws NotFoundException - when the submission does not exist
     */
    async findOne(id: string) {
        const submission = await this.submissionRepository.findById(id);
        if (!submission) throw new NotFoundException('Submission not found');
        return submission;
    }

    /**
     * updates a submission by id
     * @param id - the submission id
     * @param updateDto - the fields to update
     * @param userId - the user making the request
     * @param isAdmin - whether the requester is an admin
     * @returns the updated submission
     * @throws ForbiddenException - when the requester cannot update the submission
     */
    async update(id: string, updateDto: UpdateSubmissionDto, userId: string, isAdmin: boolean) {
        const submission = await this.findOne(id);

        if (!isAdmin) {
            const isMember = await this.teamMemberRepo.findByTeamAndUser(submission.teamId, userId);
            if (!isMember) {
                throw new ForbiddenException('You are not authorized to update this submission');
            }
        }

        return this.submissionRepository.update(id, updateDto);
    }

    /**
     * removes a submission by id
     * @param id - the submission id
     * @param userId - the user making the request
     * @param isAdmin - whether the requester is an admin
     * @returns nothing
     * @throws ForbiddenException - when the requester cannot remove the submission
     */
    async remove(id: string, userId: string, isAdmin: boolean) {
        const submission = await this.findOne(id);
        
        if (!isAdmin) {
            const isMember = await this.teamMemberRepo.findByTeamAndUser(submission.teamId, userId);
            if (!isMember) {
                throw new ForbiddenException('You are not authorized to remove this submission');
            }
        }
        
        await this.submissionRepository.remove(id);
    }
}
