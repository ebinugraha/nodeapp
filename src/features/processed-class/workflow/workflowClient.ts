import { workflowService } from "./workflowService";

export class workflowClient {
  private workflowServiceInstance: workflowService;

  constructor(workflowServiceInstance: workflowService) {
    this.workflowServiceInstance = workflowServiceInstance;
  }


  public async createWorkflow(): Promise<any> {
    console.log(`[workflowClient] Requesting create workflow`);
    const name = this.generateRandomName();
    return await this.workflowServiceInstance.createWorkflow(name);
  }
  public async getWorkflow(): Promise<any> {
    return await this.workflowServiceInstance.getWorkflow(null);
  }
  public async validateDAGLayout(): Promise<any> {
    return { valid: true };
  }
  public async workflowResponse(): Promise<any> {
    return { status: "workflow_response" };
  }
  public async executeWorkflow(workflowId: string, onNodeStatus?: (status: string) => void): Promise<boolean> {
    console.log(`[workflowClient] Executing workflow: ${workflowId}`);

    const layout = await this.validateDAGLayout();

    if (layout.valid) {
      await this.workflowServiceInstance.triggerWorkflow(workflowId, onNodeStatus);
      return true;
    } else {
      return false; // Invalid layout
    }
  }
  public generateRandomName(): string {
    return "workflow-" + Math.floor(Math.random() * 1000);
  }
  public async getMany(): Promise<any> {
    return await this.workflowServiceInstance.getAll();
  }
  public async removeWorkflow(workflowId: string): Promise<any> {
    return await this.workflowServiceInstance.remove(workflowId);
  }
}
