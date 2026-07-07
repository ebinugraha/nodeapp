import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Utility to simulate network/database latency
const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class NodeService {
  
  public async getNodes(workflowId: string): Promise<any> {
    console.log(`[NodeService] Executing SELECT * FROM nodes WHERE workflowId = '${workflowId}'`);
    
    try {
      // Real Prisma ORM Query
      const nodes = await prisma.node.findMany({
        where: { workflowId: workflowId }
      });
      
      // If none found in DB, return a default mock for demo purposes
      if (nodes.length === 0) {
        console.warn(`[NodeService] No nodes found in DB for ${workflowId}, returning fallback mock data.`);
        return { 
          status: "success", 
          nodes: [{ id: "node-1", type: "youtubeNode" }, { id: "node-2", type: "decisionNode" }] 
        };
      }
      
      return { status: "success", nodes };
    } catch (error: any) {
      console.error(`[NodeService] Error fetching nodes:`, error);
      return { status: "error", message: "Failed to fetch nodes" };
    }
  }

  public async getNode(id: string): Promise<any> {
    console.log(`[NodeService] Executing SELECT * FROM nodes WHERE id = '${id}'`);
    
    try {
      // Real Prisma ORM Query
      const node = await prisma.node.findUnique({
        where: { id: id }
      });

      if (!node) {
        // Fallback for demo purposes
        if (id === "node-1") return { type: "youtubeNode" };
        if (id === "node-2") return { type: "decisionNode" };
        throw new Error("Node not found in database.");
      }
      return node;
    } catch (error: any) {
      console.error(`[NodeService] Error fetching node:`, error.message);
      return { type: "unknown", error: error.message };
    }
  }

  public async updateNode(dataJson: any): Promise<any> {
    const parsedData = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
    const nodeId = parsedData?.id || "node-unknown";
    
    console.log(`[NodeService] Executing Prisma UPSERT for node id = '${nodeId}'`);
    
    try {
      if (!parsedData || !parsedData.id) {
        throw new Error("Invalid payload: Node ID is required for update.");
      }

      // Real Prisma ORM UPSERT Query
      const updatedNode = await (prisma.node as any).upsert({
        where: { id: parsedData.id },
        update: {
          data: parsedData.data || {},
          positionX: parsedData.position?.x,
          positionY: parsedData.position?.y,
          updatedAt: new Date()
        },
        create: {
          id: parsedData.id,
          workflowId: parsedData.workflowId || "wf-123",
          type: parsedData.type || "unknown",
          data: parsedData.data || {},
          positionX: parsedData.position?.x || 0,
          positionY: parsedData.position?.y || 0,
        }
      });
      
      console.log(`[NodeService] Successfully processed UPSERT for node ${parsedData.id}.`);

      return { 
        status: "success", 
        message: "Node updated successfully",
        node: updatedNode
      };
    } catch (error: any) {
      console.error(`[NodeService] Update failed:`, error.message);
      return { status: "error", message: error.message };
    }
  }
}
