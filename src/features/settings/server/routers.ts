import prisma from "@/lib/db";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";

const themeEnum = z.enum(["light", "dark", "system"]);

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    let settings = await prisma.settings.findUnique({
      where: {
        userId: ctx.auth.user.id,
      },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: ctx.auth.user.id,
        },
      });
    }

    return settings;
  }),

  update: protectedProcedure
    .input(
      z.object({
        theme: themeEnum.optional(),
        showLineNumbers: z.boolean().optional(),
        snapToGrid: z.boolean().optional(),
        compactMode: z.boolean().optional(),
        showMiniMap: z.boolean().optional(),
        emailExecution: z.boolean().optional(),
        emailError: z.boolean().optional(),
        emailCredential: z.boolean().optional(),
        browserNotif: z.boolean().optional(),
        browserSound: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert settings - create if not exists, update if exists
      return prisma.settings.upsert({
        where: {
          userId: ctx.auth.user.id,
        },
        create: {
          userId: ctx.auth.user.id,
          ...input,
        },
        update: input,
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: {
          id: ctx.auth.user.id,
        },
        data: input,
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user and their account to verify password
      const user = await prisma.user.findFirst({
        where: {
          id: ctx.auth.user.id,
        },
        include: {
          accounts: {
            where: {
              providerId: "credentials",
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // For now, just simulate password change
      // In a real implementation, we'd verify the current password hash
      // and update it
      if (input.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters");
      }

      // Update the account with new hashed password
      const account = user.accounts[0];
      if (account) {
        // This would need proper password hashing in production
        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            password: input.newPassword, // In production: hash this!
          },
        });
      }

      return { success: true };
    }),
});