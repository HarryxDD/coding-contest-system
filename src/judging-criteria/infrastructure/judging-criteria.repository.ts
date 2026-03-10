export abstract class judgingCriteriaRepository {
  abstract create(data: any): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByContestId(contestId: string): Promise<any[]>;
  abstract update(id: string, payload: Partial<any>): Promise<any | null>;
  abstract remove(id: string): Promise<void>;
  abstract findManyWithPagination(options: {
    contestId?: string;
    paginationOptions: any;
  }): Promise<any[]>;
  abstract countByContestId(contestId: string): Promise<number>;
}
