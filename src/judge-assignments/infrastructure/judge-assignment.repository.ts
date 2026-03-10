export abstract class judgeAssignmentRepository {
  abstract create(data: any): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByContestId(contestId: string): Promise<any[]>;
  abstract findByJudgeId(judgeId: string): Promise<any[]>;
  abstract findByContestAndJudge(contestId: string, judgeId: string): Promise<any | null>;
  abstract remove(id: string): Promise<void>;
  abstract findManyWithPagination(options: {
    contestId?: string;
    judgeId?: string;
    paginationOptions: any;
  }): Promise<any[]>;
  abstract countByContestId(contestId: string): Promise<number>;
}
