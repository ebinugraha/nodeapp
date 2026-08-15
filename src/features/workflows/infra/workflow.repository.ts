import { NodeType } from "@prisma/client";
import { PAGINATION } from "@/config/constant";
import prisma from "@/lib/db";

export class WorkflowRepository {
  async findByIdAndUser(id: string, userId: string) {
    return prisma.workflow.findFirst({
      where: { id, userId },
      include: { nodes: true, connections: true },
    });
  }

  async create(userId: string, name: string) {
    return prisma.workflow.create({
      data: {
        name,
        userId,
        nodes: {
          create: {
            type: NodeType.INTITAL,
            position: { x: 0, y: 0 },
            name: NodeType.INTITAL,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.workflow.delete({
      where: { id, userId },
    });
  }

  async updateNodesAndEdges(
    id: string,
    userId: string,
    nodes: any[],
    edges: any[],
  ) {
    // Validate workflow belongs to user
    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: { id, userId },
    });

    return await prisma.$transaction(async (tx) => {
      // Get all valid credential IDs for this user to prevent foreign key constraint violations
      const userCredentials = await tx.credential.findMany({
        where: { userId },
        select: { id: true },
      });
      const validCredentialIds = new Set(userCredentials.map((c) => c.id));

      // hapus semua node terlebih dahulu
      await tx.node.deleteMany({
        where: { workflowId: id },
      });

      // masukan lagi node terbaru
      await tx.node.createMany({
        data: nodes.map((node) => ({
          id: node.id,
          name: node.type || "unknown",
          type: node.type as NodeType,
          position: node.position,
          data: node.data || {},
          workflowId: id,
          credentialId:
            node.data?.credentialId && validCredentialIds.has(node.data.credentialId)
              ? node.data.credentialId
              : null,
        })),
      });

      // membuat connection
      await tx.connection.createMany({
        data: edges.map((edge) => ({
          workflowId: id,
          fromNodeId: edge.source,
          toNodeId: edge.target,
          fromOutput: edge.sourceHandle || "main",
          toInput: edge.targetHandle || "main",
        })),
      });

      // update kolom updatedAt di workflow
      await tx.workflow.update({
        data: { updatedAt: new Date() },
        where: { id },
      });

      return workflow;
    });
  }

  async updateName(id: string, userId: string, name: string) {
    return prisma.workflow.update({
      where: { id, userId },
      data: { name },
    });
  }

  async findManyWithPagination(
    userId: string,
    page: number,
    pageSize: number,
    search: string,
    sortBy: string = "newest"
  ) {
    let orderBy: any = { updatedAt: "desc" };
    if (sortBy === "oldest") orderBy = { updatedAt: "asc" };
    else if (sortBy === "name_asc") orderBy = { name: "asc" };
    else if (sortBy === "name_desc") orderBy = { name: "desc" };

    const [items, totalCount] = await Promise.all([
      prisma.workflow.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          userId,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        include: {
          executions: {
            where: {
              status: "RUNNING",
            },
            select: {
              id: true,
            },
          },
          nodes: true,
          connections: true,
        },
        orderBy,
      }),
      prisma.workflow.count({
        where: {
          userId,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return { items, totalCount };
  }

  async search(userId: string, query: string = "") {
    return prisma.workflow.findMany({
      where: {
        userId,
        ...(query
          ? {
              name: {
                contains: query,
                mode: "insensitive",
              },
            }
          : {}),
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });
  }
}
