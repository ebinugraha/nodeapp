import { CredentialType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { PAGINATION } from "@/config/constant";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { credentialService } from "../application/credential.service";
import prisma from "@/lib/db";

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, value } = input;
      
      if (type === CredentialType.GOOGLE) {
        const user = await prisma.user.findUnique({ where: { id: ctx.auth.user.id } });
        if (user?.plan === "FREE") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free plan is limited. Please upgrade to PRO to use Google credentials.",
          });
        }
      }

      return await credentialService.createCredential(
        ctx.auth.user.id,
        name,
        type,
        value,
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await credentialService.deleteCredential(
        input.id,
        ctx.auth.user.id,
      );
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, id, type, value } = input;

      if (type === CredentialType.GOOGLE) {
        const user = await prisma.user.findUnique({ where: { id: ctx.auth.user.id } });
        if (user?.plan === "FREE") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free plan is limited. Please upgrade to PRO to use Google credentials.",
          });
        }
      }

      return await credentialService.updateCredential(
        id,
        ctx.auth.user.id,
        name,
        type,
        value,
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await credentialService.getCredentialById(
        input.id,
        ctx.auth.user.id,
      );
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
        sortBy: z.string().default("newest"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search, sortBy } = input;
      return await credentialService.getCredentials(
        ctx.auth.user.id,
        page,
        pageSize,
        search,
        sortBy,
      );
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.nativeEnum(CredentialType) }))
    .query(async ({ ctx, input }) => {
      return await credentialService.getCredentialsByType(
        ctx.auth.user.id,
        input.type,
      );
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(0).optional() }))
    .query(async ({ input, ctx }) => {
      return await credentialService.searchCredentials(
        ctx.auth.user.id,
        input.query,
      );
    }),

  // ========================
  // Quota Procedures
  // ========================

  getQuota: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await credentialService.getYoutubeQuota(
          input.id,
          ctx.auth.user.id,
        );
      } catch (err: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: err.message,
        });
      }
    }),

  resetQuota: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["daily", "monthly", "both"]).default("both"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await credentialService.resetYoutubeQuota(
          input.id,
          ctx.auth.user.id,
          input.type,
        );
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  updateQuotaLimits: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dailyLimit: z.number().min(1).max(10000000),
        monthlyLimit: z.number().min(1).max(100000000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await credentialService.updateYoutubeQuotaLimits(
          input.id,
          ctx.auth.user.id,
          input.dailyLimit,
          input.monthlyLimit,
        );
      } catch (err: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: err.message,
        });
      }
    }),

  testConnection: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await credentialService.testYoutubeConnection(
          input.id,
          ctx.auth.user.id,
        );
      } catch (err: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: err.message,
        });
      }
    }),
});
