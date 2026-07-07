import { YoutubeService } from "../youtube/YoutubeService";
import { MLService } from "../ml/MLService";

// Utility to simulate network/database latency
const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class InngestService {
  public inngestEventId: string;
  private executionLog: any[] = [];

  constructor(inngestEventId: string) {
    this.inngestEventId = inngestEventId;
  }

  private logEvent(level: 'INFO' | 'ERROR' | 'WARN', message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data })
    };
    this.executionLog.push(logEntry);
    console.log(`[Inngest Job ${this.inngestEventId}] [${level}] ${message}`);
  }

  public async startInngest(
    workflow: any, 
    youtubeService: YoutubeService, 
    mlService: MLService,
    nodeService: any,
    onNodeStatus?: (status: string) => void
  ): Promise<any> {
    this.logEvent('INFO', `Starting orchestration for workflow: ${workflow}`);
    const executionStartTime = Date.now();
    
    try {
      // In a real Inngest function, we would fetch the DAG of nodes here
      this.logEvent('INFO', `Fetching workflow DAG from NodeService`);
      const { nodes } = await nodeService.getNodes(workflow);
      
      if (!nodes || nodes.length === 0) {
        throw new Error(`No nodes found for workflow ${workflow}. Aborting execution.`);
      }

      const results: Record<string, any> = {};

      for (const node of nodes) {
        this.logEvent('INFO', `Executing Step: Node ${node.id} (${node.type})`);
        
        if (onNodeStatus) onNodeStatus(`running_${node.id}`);
        await this.executeNode();
        
        try {
          let stepResult;
          // Strategy pattern for different node executions
          switch (node.type) {
            case "youtubeNode":
              this.logEvent('INFO', `Invoking Youtube API for node ${node.id}`);
              stepResult = await youtubeService.fetchComment("latest");
              break;
            case "decisionNode":
              this.logEvent('INFO', `Invoking ML Inference for node ${node.id}`);
              stepResult = await mlService.processTextDetection("text");
              break;
            default:
              this.logEvent('WARN', `Unknown node type ${node.type} for node ${node.id}, skipping.`);
              stepResult = { skipped: true };
          }
          
          results[node.id] = { status: "success", data: stepResult };
          if (onNodeStatus) onNodeStatus(`completed_${node.id}`);
        } catch (stepError: any) {
          this.logEvent('ERROR', `Step ${node.id} failed: ${stepError.message}`);
          results[node.id] = { status: "error", error: stepError.message };
          if (onNodeStatus) onNodeStatus(`failed_${node.id}`);
          
          // Depending on workflow config, we might abort or continue. Here we abort.
          throw new Error(`Workflow aborted due to failure in step ${node.id}`);
        }
      }

      const durationMs = Date.now() - executionStartTime;
      this.logEvent('INFO', `Workflow execution completed successfully in ${durationMs}ms`);
      
      return { 
        status: "success", 
        executionTimeMs: durationMs,
        results 
      };

    } catch (criticalError: any) {
      this.logEvent('ERROR', `CRITICAL Orchestration failure: ${criticalError.message}`);
      return { 
        status: "failed", 
        error: criticalError.message,
        executionLog: this.executionLog
      };
    }
  }

  public async executeNode(): Promise<any> {
    await simulateDelay(200); // Simulate node processing overhead
    return { status: "node_executed", timestamp: Date.now() };
  }

  public nodeStatus(status: string): any {
    this.logEvent('INFO', `External status broadcast: ${status}`);
    return { currentStatus: status, timestamp: new Date() };
  }

  public async executeResponse(): Promise<any> {
    return { status: "execution_finished", logCount: this.executionLog.length };
  }
}
