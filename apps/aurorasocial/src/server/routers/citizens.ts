/**
 * Citizens tRPC Router
 *
 * Provides endpoints for citizen/family search and profile management:
 * - citizens.search - Search citizens by name, CPF, or NIS (Story 2.2)
 * - Tenant-isolated queries (NFR2, NFR5)
 * - TÉCNICO and GESTOR access
 */

import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";

export const citizensRouter = router({
  /**
   * Search citizens by name, CPF, or NIS
   * TÉCNICO and GESTOR access
   * Story 2.2: Citizen Search Screen
   *
   * - Fuzzy search (case-insensitive, accent-insensitive)
   * - Searches: nomeCompleto, cpf, nis
   * - Tenant-isolated results only
   * - Paginated results (20 per page)
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Digite ao menos 1 caractere para pesquisar"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { query, page, limit } = input;

          // Calculate pagination
          const skip = (page - 1) * limit;

          // Search by normalized name, CPF, or NIS
          // CPF and NIS are stored normalized (digits only)
          const digitsOnly = query.replace(/\D/g, "");

          // Build search conditions dynamically
          const searchConditions: Array<{
            nomeCompleto?: { contains: string; mode: "insensitive" };
            cpf?: { contains: string };
            nis?: { contains: string };
          }> = [
            // Search by name (case-insensitive, accent-insensitive via database collation)
            {
              nomeCompleto: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ];

          // Add CPF search if input has digits
          if (digitsOnly.length > 0) {
            searchConditions.push({
              cpf: {
                contains: digitsOnly,
              },
            });

            // Add NIS search if input has digits
            searchConditions.push({
              nis: {
                contains: digitsOnly,
              },
            });
          }

          // Execute search with tenant isolation
          const [citizens, total] = await Promise.all([
            ctx.prisma.individuo.findMany({
              where: {
                tenantId: ctx.session.user.tenantId,
                OR: searchConditions,
              },
              select: {
                id: true,
                nomeCompleto: true,
                cpf: true,
                dataNascimento: true,
                nis: true,
              },
              orderBy: {
                nomeCompleto: "asc",
              },
              skip,
              take: limit,
            }),
            ctx.prisma.individuo.count({
              where: {
                tenantId: ctx.session.user.tenantId,
                OR: searchConditions,
              },
            }),
          ]);

          return {
            citizens,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          };
        },
        ctx.session.user.id
      );
    }),
});
