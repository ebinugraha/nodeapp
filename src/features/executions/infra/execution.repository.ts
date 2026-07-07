import { PAGINATION } from "@/config/constant";
import prisma from "@/lib/db";

export class ExecutionRepository {
  async findByIdAndUser(id: string, userId: string) {
    return prisma.execution.findUniqueOrThrow({
      where: {
        id,
        workflow: { userId },
      },
      include: {
        workflow: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findManyWithPagination(userId: string, page: number, pageSize: number) {
    const [items, totalCount] = await Promise.all([
      prisma.execution.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          workflow: { userId },
        },
        orderBy: { startedAt: "desc" },
        include: {
          workflow: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.execution.count({
        where: {
          workflow: { userId },
        },
      }),
    ]);

    return { items, totalCount };
  }

  async search(userId: string, query: string = "") {
    return prisma.execution.findMany({
      where: {
        workflow: {
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
      },
      take: 8,
      orderBy: { startedAt: "desc" },
      include: {
        workflow: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
