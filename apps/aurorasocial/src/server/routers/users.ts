/**
 * Users tRPC Router
 *
 * Provides GESTOR-only endpoints for user management:
 * - users.list - List all users in the same municipality (tenant)
 */

import { gestorProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";

export const usersRouter = router({
  /**
   * List all users in the current tenant (municipality)
   * GESTOR-only access
   * Automatic tenant isolation via Prisma middleware
   */
  list: gestorProcedure.query(async ({ ctx }) => {
    return await withTenantContext(
      ctx.session.user.tenantId,
      async () => {
        const users = await ctx.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return users;
      },
      ctx.session.user.id
    );
  }),
});
