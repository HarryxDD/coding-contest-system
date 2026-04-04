import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { submissionRepository } from './infrastructure/submission.repository';
import { contestRepository } from '../contests/infrastructure/contest.repository';
import { teamRepository } from '../teams/infrastructure/team.repository';
import { teamMemberRepository } from '../team-members/infrastructure/team-member.repository';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { StatusEnum } from './infrastructure/entities/submission.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepo: submissionRepository,
    private readonly contestRepo: contestRepository,
    private readonly teamRepo: teamRepository,
    private readonly teamMemberRepo: teamMemberRepository,
  ) {}

  /**
   * creates a submission for a contest
   * @param contestId - the contest id
   * @param createSubmissionDto - the submission details to create
   * @param userId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns the created submission
   * @throws BadRequestException - when team id or title is missing or team does not belong to contest
   * @throws NotFoundException - when the contest or team does not exist
   * @throws ForbiddenException - when the requester is not a member of the team
   */
  async createForContest(
    contestId: string,
    createSubmissionDto: CreateSubmissionDto,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.ensureContestExists(contestId);

    if (!createSubmissionDto.teamId || !createSubmissionDto.title?.trim()) {
      throw new BadRequestException('team id and title are required');
    }

    const team = await this.teamRepo.findById(createSubmissionDto.teamId);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    if (team.contestId !== contestId) {
      throw new BadRequestException('team does not belong to this contest');
    }

    if (!isAdmin) {
      const isMember = await this.teamMemberRepo.findByTeamAndUser(
        createSubmissionDto.teamId,
        userId,
      );
      if (!isMember) {
        throw new ForbiddenException('you must be a member of the team to submit');
      }
    }

    return this.submissionRepo.create({
      ...createSubmissionDto,
      contestId,
      status: StatusEnum.SUBMITTED,
    });
  }

  /**
   * returns paginated submissions for a contest
   * @param contestId - the contest id
   * @param queryDto - the pagination and filter options
   * @returns the paginated submission list
   * @throws NotFoundException - when the contest does not exist
   */
  async findAllForContest(contestId: string, queryDto: QuerySubmissionDto) {
    await this.ensureContestExists(contestId);

    return this.submissionRepo.findManyWithPagination({
      filterOptions: {
        ...queryDto.filters,
        contestId,
      },
      sortOptions: queryDto.sort,
      paginationOptions: {
        page: queryDto.page ?? 1,
        limit: queryDto.limit ?? 10,
      },
    });
  }

  /**
   * returns a submission by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @returns the matching submission
   * @throws NotFoundException - when the contest or submission does not exist
   */
  async findOneForContest(contestId: string, id: string) {
    await this.ensureContestExists(contestId);

    const submission = await this.submissionRepo.findById(id);
    if (!submission || submission.contestId !== contestId) {
      throw new NotFoundException('submission not found');
    }

    return submission;
  }

  /**
   * updates a submission by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @param updateDto - the fields to update
   * @param userId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns the updated submission
   * @throws ForbiddenException - when the requester is not a member of the team
   */
  async updateForContest(
    contestId: string,
    id: string,
    updateDto: UpdateSubmissionDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const submission = await this.findOneForContest(contestId, id);

    if (!isAdmin) {
      const isMember = await this.teamMemberRepo.findByTeamAndUser(
        submission.teamId,
        userId,
      );
      if (!isMember) {
        throw new ForbiddenException('you are not authorized to update this submission');
      }
    }

    const {
      contestId: _c,
      teamId: _t,
      ...safeUpdate
    } = updateDto as UpdateSubmissionDto & { contestId?: string; teamId?: string };

    void _c;
    void _t;

    return this.submissionRepo.update(id, safeUpdate);
  }

  /**
   * removes a submission by id scoped to a contest
   * @param contestId - the contest id
   * @param id - the submission id
   * @param userId - the user making the request
   * @param isAdmin - whether the requester is an admin
   * @returns nothing
   * @throws ForbiddenException - when the requester is not a member of the team
   */
  async removeForContest(
    contestId: string,
    id: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const submission = await this.findOneForContest(contestId, id);

    if (!isAdmin) {
      const isMember = await this.teamMemberRepo.findByTeamAndUser(
        submission.teamId,
        userId,
      );
      if (!isMember) {
        throw new ForbiddenException('you are not authorized to remove this submission');
      }
    }

    await this.submissionRepo.remove(id);
  }

  // used internally by scores service to verify submission exists
  async findById(id: string) {
    const submission = await this.submissionRepo.findById(id);
    if (!submission) throw new NotFoundException('submission not found');
    return submission;
  }

  private async ensureContestExists(contestId: string) {
    const contest = await this.contestRepo.findById(contestId);
    if (!contest) {
      throw new NotFoundException('contest not found');
    }
    return contest;
  }
}