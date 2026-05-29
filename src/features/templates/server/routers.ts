import { NodeType } from "@prisma/client";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

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

      return prisma.template.create({
        data: {
          name,
          description,
          nodeType,
          config,
          userId: ctx.auth.user.id,
        },
      });
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

      return prisma.template.update({
        where: { id, userId: ctx.auth.user.id },
        data: { name, description, config },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.template.delete({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return prisma.template.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { updatedAt: "desc" },
    });
  }),

  getByNodeType: protectedProcedure
    .input(z.object({ nodeType: z.nativeEnum(NodeType) }))
    .query(async ({ ctx, input }) => {
      return prisma.template.findMany({
        where: { userId: ctx.auth.user.id, nodeType: input.nodeType },
        orderBy: { updatedAt: "desc" },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.template.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),
});
