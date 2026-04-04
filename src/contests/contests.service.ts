import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { contestRepository } from "./infrastructure/contest.repository";
import { CreateContestDto } from "./dto/create-contest.dto";
import { QueryContestDto } from "./dto/query-contest.dto";
import { UpdateContestDto } from "./dto/update-contest.dto";

@Injectable()
export class ContestsService {
    constructor(
        private readonly contestRepository: contestRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    /**
     * creates a contest
     * @param createContestDto - the contest details to create
     * @param organizerId - the organizer user id
     * @returns the created contest
     * @throws BadRequestException - when the end date is not after the start date
     */
    async create(createContestDto: CreateContestDto, organizerId: string) {
        if (new Date(createContestDto.startDate) >= new Date(createContestDto.endDate)) {
            throw new BadRequestException('end date must be strictly after start date');
        }

        const result = await this.contestRepository.create({
            ...createContestDto,
            organizerId: organizerId,
            startDate: new Date(createContestDto.startDate),
            endDate: new Date(createContestDto.endDate),
            submissionDeadline: new Date(createContestDto.submissionDeadline),
        });

        // invalidate contest list cache so new contest appears immediately
        await this.cacheManager.del('contests_list');
        return result;
    }

    /**
     * returns paginated contests
     * @param queryDto - the pagination and filter options
     * @returns the paginated contest list
     */
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

    /**
     * returns a contest by id
     * @param id - the contest id
     * @returns the matching contest
     * @throws NotFoundException - when the contest does not exist
     */
    async findOne(id: string) {
        const contest = await this.contestRepository.findById(id);
        if (!contest) throw new NotFoundException('contest not found');

        return contest;
    }

    /**
     * updates a contest by id
     * @param id - the contest id
     * @param updateDto - the fields to update
     * @param requestingUserId - the user making the request
     * @param isAdmin - whether the requester is an admin
     * @returns the updated contest
     * @throws ForbiddenException - when the requester is not the organizer or an admin
     */
    async update(id: string, updateDto: UpdateContestDto, requestingUserId: string, isAdmin: boolean) {
        const contest = await this.findOne(id);

        if (contest.organizerId !== requestingUserId && !isAdmin) {
            throw new ForbiddenException('you are not authorized to edit this contest');
        }

        const result = await this.contestRepository.update(id, {
            ...updateDto,
            startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
            endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
            submissionDeadline: updateDto.submissionDeadline ? new Date(updateDto.submissionDeadline) : undefined,
        });

        // invalidate contest list cache so updated data is reflected immediately
        await this.cacheManager.del('contests_list');
        return result;
    }

    /**
     * removes a contest by id
     * @param id - the contest id
     * @param requestingUserId - the user making the request
     * @param isAdmin - whether the requester is an admin
     * @returns nothing
     * @throws ForbiddenException - when the requester is not the organizer or an admin
     */
    async remove(id: string, requestingUserId: string, isAdmin: boolean) {
        const contest = await this.findOne(id);

        if (contest.organizerId !== requestingUserId && !isAdmin) {
            throw new ForbiddenException('you are not authorized to delete this contest');
        }

        await this.contestRepository.remove(id);

        // invalidate contest list cache after deletion
        await this.cacheManager.del('contests_list');
    }
}