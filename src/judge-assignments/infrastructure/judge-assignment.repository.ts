export const judgeAssignmentRepository = Symbol('JudgeAssignmentRepository');

export interface IJudgeAssignmentRepository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByContestId(contestId: string): Promise<any[]>;
  findByJudgeId(judgeId: string): Promise<any[]>;
  findByContestAndJudge(contestId: string, judgeId: string): Promise<any | null>;
  remove(id: string): Promise<void>;
  findManyWithPagination(options: {
    contestId?: string;
    judgeId?: string;
    paginationOptions: any;
  }): Promise<any[]>;
  countByContestId(contestId: string): Promise<number>;
}
