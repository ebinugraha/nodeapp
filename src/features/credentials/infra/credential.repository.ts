import { CredentialType } from "@prisma/client";
import { PAGINATION } from "@/config/constant";
import prisma from "@/lib/db";

export class CredentialRepository {
  async create(
    userId: string,
    name: string,
    type: CredentialType,
    value: string,
  ) {
    return prisma.credential.create({
      data: {
        name,
        userId,
        type,
        value, // TODO: add encrypting in production
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.credential.delete({
      where: { id, userId },
    });
  }

  async update(
    id: string,
    userId: string,
    name: string,
    type: CredentialType,
    value: string,
  ) {
    // Validate existence and ownership
    await prisma.credential.findUniqueOrThrow({
      where: { id, userId },
    });

    return prisma.credential.update({
      where: { id, userId },
      data: {
        name,
        type,
        value, // TODO: encrypt the value
      },
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    return prisma.credential.findUniqueOrThrow({
      where: { id, userId },
    });
  }

  async findManyWithPagination(
    userId: string,
    page: number,
    pageSize: number,
    search: string,
    sortBy: string = "newest",
  ) {
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    else if (sortBy === "name_asc") orderBy = { name: "asc" };
    else if (sortBy === "name_desc") orderBy = { name: "desc" };

    const [items, totalCount] = await Promise.all([
      prisma.credential.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          userId,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        orderBy,
      }),
      prisma.credential.count({
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

  async findByType(userId: string, type: CredentialType) {
    return prisma.credential.findMany({
      where: { userId, type },
      orderBy: { updatedAt: "desc" },
    });
  }

  async search(userId: string, query: string = "") {
    return prisma.credential.findMany({
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
        type: true,
        updatedAt: true,
      },
    });
  }

  async findYoutubeCredential(id: string, userId: string) {
    return prisma.credential.findFirst({
      where: {
        id,
        userId,
        type: CredentialType.YOUTUBE,
      },
    });
  }
}
