/**
 * Role-based procedure guards for tRPC
 *
 * This module provides middleware for protecting tRPC procedures based on user roles.
 * When tRPC is fully integrated, these will be used to create protected procedures.
 *
 * Usage (when tRPC is set up):
 *
 * import { gestorProcedure, tecnicoProcedure } from './auth-procedures';
 *
 * export const usersRouter = router({
 *   invite: gestorProcedure
 *     .input(z.object({ email: z.string().email() }))
 *     .mutation(async ({ input, ctx }) => {
 *       // Only GESTORs can access this
 *     }),
 * });
 */

import { Role } from "@prisma/client";

/**
 * Error class for unauthorized access attempts
 */
export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Error class for forbidden access attempts (authenticated but wrong role)
 */
export class ForbiddenError extends Error {
  constructor(message: string = "Forbidden - insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Type definition for tRPC context with session
 */
export interface AuthContext {
  session: {
    user: {
      id: string;
      tenantId: string;
      role: Role;
      email: string;
      name: string;
    };
  } | null;
}

/**
 * Middleware function to enforce GESTOR role requirement
 * Throws ForbiddenError if user is not a GESTOR
 */
export function enforceGestorRole(ctx: AuthContext) {
  if (!ctx.session) {
    throw new UnauthorizedError("Authentication required");
  }

  if (ctx.session.user.role !== "GESTOR") {
    throw new ForbiddenError("This action requires GESTOR role");
  }

  return ctx;
}

/**
 * Middleware function to enforce authenticated user (any role)
 * Throws UnauthorizedError if user is not authenticated
 */
export function enforceAuthenticated(ctx: AuthContext) {
  if (!ctx.session) {
    throw new UnauthorizedError("Authentication required");
  }

  return ctx;
}

/**
 * Check if user has GESTOR role
 */
export function isGestor(ctx: AuthContext): boolean {
  return ctx.session?.user?.role === "GESTOR";
}

/**
 * Check if user has TECNICO role
 */
export function isTecnico(ctx: AuthContext): boolean {
  return ctx.session?.user?.role === "TECNICO";
}

/**
 * Get user's tenant ID from context
 * Throws error if not authenticated
 */
export function getTenantId(ctx: AuthContext): string {
  if (!ctx.session?.user?.tenantId) {
    throw new UnauthorizedError("Tenant ID not found in session");
  }

  return ctx.session.user.tenantId;
}

/**
 * Get user's ID from context
 * Throws error if not authenticated
 */
export function getUserId(ctx: AuthContext): string {
  if (!ctx.session?.user?.id) {
    throw new UnauthorizedError("User ID not found in session");
  }

  return ctx.session.user.id;
}

// When tRPC is integrated, these will be exported as actual procedure builders:
// export const publicProcedure = t.procedure;
// export const protectedProcedure = publicProcedure.use(enforceAuthenticated);
// export const gestorProcedure = publicProcedure.use(enforceGestorRole);
// export const tecnicoProcedure = publicProcedure.use(enforceAuthenticated);
