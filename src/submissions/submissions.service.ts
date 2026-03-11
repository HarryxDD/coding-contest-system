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

        if (!isAdmin) {
            const isMember = await this.teamMemberRepo.findByTeamAndUser(submission.teamId, userId);
            if (!isMember) {
                throw new ForbiddenException('You are not authorized to update this submission');
            }
        }

        return this.submissionRepository.update(id, updateDto);
    }

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
