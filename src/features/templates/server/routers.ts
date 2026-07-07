import { NodeType } from "@prisma/client";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { templateService } from "../application/template.service";

export const templatesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        nodeType: z.nativeEnum(NodeType),
        config: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description, nodeType, config } = input;
      return await templateService.createTemplate(
        ctx.auth.user.id,
        name,
        description,
        nodeType,
        config,
      );
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        config: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description, config } = input;
      return await templateService.updateTemplate(
        id,
        ctx.auth.user.id,
        name,
        description,
        config,
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await templateService.deleteTemplate(input.id, ctx.auth.user.id);
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await templateService.getAllTemplates(ctx.auth.user.id);
  }),

  getByNodeType: protectedProcedure
    .input(z.object({ nodeType: z.nativeEnum(NodeType) }))
    .query(async ({ ctx, input }) => {
      return await templateService.getTemplatesByNodeType(
        ctx.auth.user.id,
        input.nodeType,
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await templateService.getTemplateById(input.id, ctx.auth.user.id);
    }),
});
