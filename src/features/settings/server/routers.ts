import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { settingsService } from "../application/settings.service";

const themeEnum = z.enum(["light", "dark", "system"]);

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await settingsService.getSettings(ctx.auth.user.id);
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
      return await settingsService.updateSettings(ctx.auth.user.id, input);
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await settingsService.updateProfile(ctx.auth.user.id, input);
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await settingsService.changePassword(
        ctx.auth.user.id,
        input.newPassword,
      );
    }),
});
