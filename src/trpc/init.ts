import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// Better Auth session type
interface SessionWithUser {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const createTRPCContext = cache(async (opts?: FetchCreateContextFnOptions) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  let sessionHeaders;
  if (opts?.req) {
    sessionHeaders = opts.req.headers;
  } else {
    sessionHeaders = await headers();
  }

  const session = await auth.api.getSession({
    headers: sessionHeaders,
  });

  return {
    userId: session?.user?.id,
    session,
  };
});

// Context type for type safety
export type TRPCContext = {
  userId: string | undefined;
  session: SessionWithUser | null;
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = ctx.session;

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});

// Note: premiumProcedure removed - payment/subscription system disabled