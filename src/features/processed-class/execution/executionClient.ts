import { executionService } from "./executionService";

export class executionClient {
  private executionServiceInstance: executionService;

  constructor(executionServiceInstance: executionService) {
    this.executionServiceInstance = executionServiceInstance;
  }

  public async getAll(): Promise<any> {
    return await this.executionServiceInstance.getMany();
  }
}
