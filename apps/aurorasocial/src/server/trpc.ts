/**
 * tRPC Server Configuration
 *
 * This module sets up the tRPC server with:
 * - Context creation (session, tenant isolation)
 * - Procedure builders (public, protected, gestor, tecnico)
 * - Type-safe error handling
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import { Role } from "@prisma/client";

/**
 * Create tRPC context from Next.js request
 * Includes session and prisma client
 */
export async function createTRPCContext(_opts: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    session,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure builders
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware to enforce authentication
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({
    ctx: {
      session: ctx.session as Session & {
        user: {
          id: string;
          tenantId: string;
          role: Role;
          email: string;
          name: string;
        };
      },
    },
  });
});

/**
 * Middleware to enforce GESTOR role
 */
const isGestor = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  if (ctx.session.user.role !== "GESTOR") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action requires GESTOR role",
    });
  }

  return next({
    ctx: {
      session: ctx.session as Session & {
        user: {
          id: string;
          tenantId: string;
          role: Role;
          email: string;
          name: string;
        };
      },
    },
  });
});

/**
 * Protected procedure (any authenticated user)
 */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/**
 * GESTOR-only procedure
 */
export const gestorProcedure = t.procedure.use(isGestor);

/**
 * TECNICO or GESTOR procedure (authenticated)
 */
export const tecnicoProcedure = protectedProcedure;
