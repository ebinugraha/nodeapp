import { ExecutionRepository } from "../infra/execution.repository";

export class ExecutionService {
  private repository: ExecutionRepository;

  constructor() {
    this.repository = new ExecutionRepository();
  }

  async getExecutionById(id: string, userId: string) {
    return this.repository.findByIdAndUser(id, userId);
  }

  async getLatestExecutionByWorkflowId(workflowId: string, userId: string) {
    return this.repository.findLatestByWorkflowId(workflowId, userId);
  }

  async getExecutions(userId: string, page: number, pageSize: number) {
    const { items, totalCount } = await this.repository.findManyWithPagination(
      userId,
      page,
      pageSize,
    );

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async searchExecutions(userId: string, query?: string) {
    return this.repository.search(userId, query);
  }
}

export const executionService = new ExecutionService();
