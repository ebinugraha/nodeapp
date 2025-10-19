import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(async () => {
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: { email: "febrian.14nugraha@gmail.com" },
    });

    return {
      success: true,
      message: "Workflow creation triggered",
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
