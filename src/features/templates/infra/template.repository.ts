import type { NodeType } from "@prisma/client";
import prisma from "@/lib/db";

export class TemplateRepository {
  async create(
    userId: string,
    name: string,
    description: string | undefined,
    nodeType: NodeType,
    config: any,
  ) {
    return prisma.template.create({
      data: {
        name,
        description,
        nodeType,
        config,
        userId,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    name: string,
    description: string | undefined,
    config: any,
  ) {
    return prisma.template.update({
      where: { id, userId },
      data: { name, description, config },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.template.delete({
      where: { id, userId },
    });
  }

  async getAllByUserId(userId: string) {
    return prisma.template.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getByNodeType(userId: string, nodeType: NodeType) {
    return prisma.template.findMany({
      where: { userId, nodeType },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getByIdAndUser(id: string, userId: string) {
    return prisma.template.findUniqueOrThrow({
      where: { id, userId },
    });
  }
}
