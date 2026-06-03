import { NodeService } from "./NodeService";

export class NodeClient {
  private nodeService: NodeService;

  constructor(nodeService: NodeService) {
    this.nodeService = nodeService;
  }

  public async getNodes(workflowId: string): Promise<any> {
    return await this.nodeService.getNodes(workflowId);
  }
  public async saveNode(dataJson: any): Promise<any> {
    console.log(`[NodeClient] Saving node data`);
    return await this.nodeService.updateNode(dataJson);
  }
}
