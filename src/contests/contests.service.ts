import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { contestRepository } from "./infrastructure/contest.repository";
import { CreateContestDto } from "./dto/create-contest.dto";
import { QueryContestDto } from "./dto/query-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";

@Injectable()
export class ContestsService {
    constructor(private readonly contestRepository: contestRepository) { }

    async create(createContestDto: CreateContestDto, organizerId: string) {
        if (new Date(createContestDto.startDate) >= new Date(createContestDto.endDate)) {
            throw new BadRequestException('End date must be strictly after start date');
        }

        return this.contestRepository.create({
            ...createContestDto,
            organizerId: organizerId,
            startDate: new Date(createContestDto.startDate),
            endDate: new Date(createContestDto.endDate),
            submissionDeadline: new Date(createContestDto.submissionDeadline),
        })
    }

    async findAll(queryDto: QueryContestDto) {
        return this.contestRepository.findManyWithPagination({
            filterOptions: queryDto.filters,
            sortOptions: queryDto.sort,
            paginationOptions: {
                page: queryDto.page ?? 1,
                limit: queryDto.limit ?? 10,
            }
        });
    }

    async findOne(id: string) {
        const contest = await this.contestRepository.findById(id);
        if (!contest) throw new NotFoundException('Contest not found');

        return contest;
    }

    async update(id: string, updateDto: UpdateContestDto, requestingUserId: string, isAdmin: boolean) {
        const contest = await this.findOne(id);

        // Only the exact organizer or an Admin can edit the contest
        if (contest.organizerId !== requestingUserId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to edit this contest');
        }

        return this.contestRepository.update(id, {
            ...updateDto,
            startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
            endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
            submissionDeadline: updateDto.submissionDeadline ? new Date(updateDto.submissionDeadline) : undefined,
        });
    }

    async remove(id: string, requestingUserId: string, isAdmin: boolean) {
        const contest = await this.findOne(id);

        // Only the exact organizer or an Admin can delete
        if (contest.organizerId !== requestingUserId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to delete this contest');
        }
        await this.contestRepository.remove(id);
    }
}