import { PAGINATION } from "@/config/constant";
import { CredentialType } from "@prisma/client";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { getYoutubeQuotaUsage, resetYoutubeQuota, updateQuotaLimits, testYoutubeConnection } from "../lib/quota-tracking";

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, value } = input;

      return prisma.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value, // TODO add encrypting in production
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),

        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, id, type, value } = input;

      const creadential = await prisma.credential.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return prisma.credential.update({
        where: { id, userId: ctx.auth.user.id },
        data: {
          name,
          type,
          value, // TODO encruipt the value
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.credential.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

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
    }),
  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(async ({ ctx, input }) => {
      const { type } = input;

      return prisma.credential.findMany({
        where: {
          userId: ctx.auth.user.id,
          type,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(0).optional() }))
    .query(async ({ input, ctx }) => {
      return prisma.credential.findMany({
        where: {
          userId: ctx.auth.user.id,
          ...(input.query
            ? {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        take: 8,
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          name: true,
          type: true,
          updatedAt: true,
        },
      });
    }),

  // ========================
  // Quota Procedures
  // ========================

  getQuota: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
          type: CredentialType.YOUTUBE,
        },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "YouTube credential not found",
        });
      }

      return getYoutubeQuotaUsage(credential.id, ctx.auth.user.id);
    }),

  resetQuota: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["daily", "monthly", "both"]).default("both"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
          type: CredentialType.YOUTUBE,
        },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "YouTube credential not found",
        });
      }

      const success = await resetYoutubeQuota(credential.id, ctx.auth.user.id, input.type);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset quota",
        });
      }

      return { success: true, type: input.type };
    }),

  updateQuotaLimits: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dailyLimit: z.number().min(1).max(10000000),
        monthlyLimit: z.number().min(1).max(100000000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
          type: CredentialType.YOUTUBE,
        },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "YouTube credential not found",
        });
      }

      await updateQuotaLimits(credential.id, input.dailyLimit, input.monthlyLimit);

      return { success: true };
    }),

  testConnection: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
          type: CredentialType.YOUTUBE,
        },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "YouTube credential not found",
        });
      }

      return testYoutubeConnection(credential.id);
    }),
});
