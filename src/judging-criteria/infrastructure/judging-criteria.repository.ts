export const judgingCriteriaRepository = Symbol('JudgingCriteriaRepository');

export interface IJudgingCriteriaRepository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByContestId(contestId: string): Promise<any[]>;
  update(id: string, payload: Partial<any>): Promise<any | null>;
  remove(id: string): Promise<void>;
  findManyWithPagination(options: {
    contestId?: string;
    paginationOptions: any;
  }): Promise<any[]>;
  countByContestId(contestId: string): Promise<number>;
}
