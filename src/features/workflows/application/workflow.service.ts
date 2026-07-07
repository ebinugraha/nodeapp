import type { Edge, Node } from "@xyflow/react";
import { generateSlug } from "random-word-slugs";
import { sendWorkflowExecution } from "@/lib/send-workflow-execution";
import { topologicalSort } from "@/lib/topologicalSort";
import { WorkflowRepository } from "../infra/workflow.repository";

export class WorkflowService {
  private repository: WorkflowRepository;

  constructor() {
    this.repository = new WorkflowRepository();
  }

  async executeWorkflow(id: string, userId: string) {
    const workflow = await this.repository.findByIdAndUser(id, userId);

    try {
      topologicalSort(workflow.nodes, workflow.connections);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Workflow contains a cycle."
      ) {
        throw new Error("Workflow contains a cycle.");
      }
      throw error;
    }

    await sendWorkflowExecution({ workflowId: workflow.id });

    return workflow;
  }

  async createWorkflow(userId: string) {
    const name = generateSlug(3);
    return this.repository.create(userId, name);
  }

  async deleteWorkflow(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async updateWorkflowLayout(
    id: string,
    userId: string,
    nodes: any[],
    edges: any[],
  ) {
    return this.repository.updateNodesAndEdges(id, userId, nodes, edges);
  }

  async updateWorkflowName(id: string, userId: string, name: string) {
    return this.repository.updateName(id, userId, name);
  }

  async getWorkflowById(id: string, userId: string) {
    const workflow = await this.repository.findByIdAndUser(id, userId);

    const nodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position as { x: number; y: number },
      data: (node.data as Record<string, unknown>) || {},
    }));

    const edges: Edge[] = workflow.connections.map((connection) => ({
      id: connection.id,
      source: connection.fromNodeId,
      target: connection.toNodeId,
      sourceHandle: connection.fromOutput,
      targetHandle: connection.toInput,
    }));

    return {
      id: workflow.id,
      name: workflow.name,
      nodes,
      edges,
    };
  }

  async getWorkflows(
    userId: string,
    page: number,
    pageSize: number,
    search: string,
  ) {
    const { items, totalCount } = await this.repository.findManyWithPagination(
      userId,
      page,
      pageSize,
      search,
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

  async searchWorkflows(userId: string, query?: string) {
    return this.repository.search(userId, query);
  }
}

export const workflowService = new WorkflowService();
