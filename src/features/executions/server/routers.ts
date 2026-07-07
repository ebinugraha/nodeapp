import z from "zod";
import { PAGINATION } from "@/config/constant";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { executionService } from "../application/execution.service";

export const exectutionRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await executionService.getExecutionById(
        input.id,
        ctx.auth.user.id,
      );
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input;
      return await executionService.getExecutions(
        ctx.auth.user.id,
        page,
        pageSize,
      );
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(0).optional() }))
    .query(async ({ input, ctx }) => {
      return await executionService.searchExecutions(
        ctx.auth.user.id,
        input.query,
      );
    }),
});
