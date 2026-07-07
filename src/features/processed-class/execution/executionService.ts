import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Utility to simulate network/database latency
const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class executionService {
  
  public async getMany(limit: number = 10, statusFilter?: string): Promise<any> {
    console.log(`[executionService] Executing SELECT * FROM execution_logs ${statusFilter ? `WHERE status='${statusFilter}'` : ''} LIMIT ${limit}`);
    
    try {
      // Real Prisma ORM Query
      const executions = await (prisma as any).executionLog.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: { startedAt: 'desc' },
        take: limit
      });

      const totalCount = await (prisma as any).executionLog.count({
        where: statusFilter ? { status: statusFilter } : undefined
      });

      console.log(`[executionService] Retrieved ${executions.length} execution records.`);
      
      return { 
        status: "success", 
        data: executions,
        metadata: {
          total_count: totalCount,
          returned_count: executions.length,
          page: 1
        }
      };
    } catch (error: any) {
      console.error(`[executionService] DB Query failed:`, error.message);
      return { status: "error", message: "Failed to retrieve execution logs." };
    }
  }

  public async getExecutionById(executionId: string): Promise<any> {
    console.log(`[executionService] Executing SELECT * FROM execution_logs WHERE id='${executionId}'`);
    
    try {
      // Real Prisma ORM Query
      const exec = await (prisma as any).executionLog.findUnique({
        where: { id: executionId }
      });

      if (!exec) {
        return { status: "not_found", message: `Execution ${executionId} not found in DB.` };
      }

      return { status: "success", data: exec };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  }

  // A method to simulate logging an execution (called internally by workflow or inngest service in a real scenario)
  public async logExecution(workflowId: string, status: string, durationMs: number, errorMsg?: string): Promise<any> {
    try {
      // Real Prisma ORM Query
      const newLog = await (prisma as any).executionLog.create({
        data: {
          workflowId: workflowId,
          status: status,
          durationMs: durationMs,
          startedAt: new Date(),
          error: errorMsg || null
        }
      });
      
      return { status: "success", id: newLog.id };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  }
}
