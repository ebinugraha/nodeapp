import { TRPCError } from "@trpc/server";
import z from "zod";
import { PAGINATION } from "@/config/constant";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { workflowService } from "../application/workflow.service";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await workflowService.executeWorkflow(
          input.id,
          ctx.auth.user.id,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Workflow contains a cycle."
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Error: Workflow contains a cycle.",
          });
        }
        throw error;
      }
    }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    return await workflowService.createWorkflow(ctx.auth.user.id);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await workflowService.deleteWorkflow(input.id, ctx.auth.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            data: z.record(z.string(), z.any()),
            position: z.object({
              x: z.number(),
              y: z.number(),
            }),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { edges, id, nodes } = input;
      return await workflowService.updateWorkflowLayout(
        id,
        ctx.auth.user.id,
        nodes,
        edges,
      );
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await workflowService.updateWorkflowName(
        input.id,
        ctx.auth.user.id,
        input.name,
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await workflowService.getWorkflowById(input.id, ctx.auth.user.id);
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
      return await workflowService.getWorkflows(
        ctx.auth.user.id,
        page,
        pageSize,
        search,
      );
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(0).optional() }))
    .query(async ({ input, ctx }) => {
      return await workflowService.searchWorkflows(
        ctx.auth.user.id,
        input.query,
      );
    }),
});
