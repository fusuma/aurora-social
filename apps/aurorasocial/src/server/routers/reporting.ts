/**
 * Reporting Router (Reports API)
 *
 * Story 3.1: Fundação de API para Relatórios (Reports API Foundation)
 * GESTOR-only endpoints for dashboard metrics and RMA report generation
 *
 * - Dashboard metrics with 1-hour cache (NFR3)
 * - RMA report generation with date filtering (FR4)
 * - Optimized SQL aggregations (COUNT, GROUP BY, no SELECT *)
 * - Mandatory tenant filtering (NFR2, NFR5)
 * - GESTOR-only access (NFR4)
 *
 * AC1: Specific API endpoints created (/api/reports/dashboard-metrics, /api/reports/rma)
 * AC2: Endpoints accept filter parameters (month, year for RMA)
 * AC3: SQL queries optimized for aggregation (COUNT, GROUP BY, no SELECT *)
 * AC4: Queries filter by tenantId (from Auth.js session)
 * AC5: Endpoints protected by GESTOR role
 * AC6: Dashboard query uses cache with 1-hour TTL
 * AC7: Integration tests verify aggregation, tenant filtering, and role protection
 */

import { z } from "zod";
import { gestorProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * In-memory cache for dashboard metrics
 * Key: `dashboard:${tenantId}`
 * TTL: 1 hour (3600000ms)
 *
 * Rationale: Dashboard metrics change infrequently, hourly refresh is acceptable
 * per FR6 ACs. In-memory cache per function instance is sufficient for MVP scale.
 * Invalidation: Manual refresh button on frontend, auto-refetch after 1 hour.
 */
interface CacheEntry<T> {
  data: T;
  expires: number; // Unix timestamp
}

const dashboardCache = new Map<string, CacheEntry<DashboardMetrics>>();

// Dashboard Metrics Interface
interface DashboardMetrics {
  totalAtendimentos: number;
  totalFamilias: number;
  totalIndividuos: number;
  atendimentosPorMes: Array<{
    mes: string; // YYYY-MM format
    count: number;
  }>;
  atendimentosPorTipoDemanda: Array<{
    tipoDemanda: string;
    count: number;
  }>;
  ultimaAtualizacao: Date;
}

// RMA Report Data Interface
interface RMAReportData {
  mes: number;
  ano: number;
  totalAtendimentos: number;
  atendimentosPorTipoDemanda: Array<{
    tipoDemanda: string;
    count: number;
  }>;
  atendimentosPorDia: Array<{
    dia: number;
    count: number;
  }>;
  totalFamiliasAtendidas: number;
  totalIndividuosAtendidos: number;
}

/**
 * Get dashboard metrics from cache or database
 * Implements 1-hour cache per AC6
 */
async function getCachedDashboardMetrics(
  tenantId: string,
  ctx: { prisma: PrismaClient }
): Promise<DashboardMetrics> {
  const cacheKey = `dashboard:${tenantId}`;
  const cached = dashboardCache.get(cacheKey);

  // Check if cached and not expired
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Cache miss or expired - fetch from database
  const metrics = await fetchDashboardMetrics(tenantId, ctx);

  // Store in cache with 1-hour TTL
  dashboardCache.set(cacheKey, {
    data: metrics,
    expires: Date.now() + 3600000, // 1 hour
  });

  return metrics;
}

/**
 * Fetch dashboard metrics from database
 * Optimized SQL aggregations (AC3)
 * Mandatory tenant filtering (AC4)
 */
async function fetchDashboardMetrics(
  tenantId: string,
  ctx: { prisma: PrismaClient }
): Promise<DashboardMetrics> {
  // AC3: Use COUNT and GROUP BY for aggregation, no SELECT *
  // AC4: All queries filter by tenantId

  // Total atendimentos
  const totalAtendimentos = await ctx.prisma.atendimento.count({
    where: { tenantId },
  });

  // Total familias
  const totalFamilias = await ctx.prisma.familia.count({
    where: { tenantId },
  });

  // Total individuos
  const totalIndividuos = await ctx.prisma.individuo.count({
    where: { tenantId },
  });

  // Atendimentos por mês (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const atendimentosPorMesRaw = await ctx.prisma.$queryRaw<Array<{ mes: string; count: bigint }>>`
    SELECT
      TO_CHAR(data, 'YYYY-MM') as mes,
      COUNT(*) as count
    FROM "Atendimento"
    WHERE "tenantId" = ${tenantId}
      AND data >= ${twelveMonthsAgo}
    GROUP BY TO_CHAR(data, 'YYYY-MM')
    ORDER BY mes DESC
    LIMIT 12
  `;

  const atendimentosPorMes = atendimentosPorMesRaw.map((row: { mes: string; count: bigint }) => ({
    mes: row.mes,
    count: Number(row.count),
  }));

  // Atendimentos por tipo de demanda
  const atendimentosPorTipoDemandaRaw = await ctx.prisma.$queryRaw<
    Array<{ tipoDemanda: string; count: bigint }>
  >`
    SELECT
      "tipoDemanda",
      COUNT(*) as count
    FROM "Atendimento"
    WHERE "tenantId" = ${tenantId}
    GROUP BY "tipoDemanda"
    ORDER BY count DESC
  `;

  const atendimentosPorTipoDemanda = atendimentosPorTipoDemandaRaw.map(
    (row: { tipoDemanda: string; count: bigint }) => ({
      tipoDemanda: row.tipoDemanda,
      count: Number(row.count),
    })
  );

  return {
    totalAtendimentos,
    totalFamilias,
    totalIndividuos,
    atendimentosPorMes,
    atendimentosPorTipoDemanda,
    ultimaAtualizacao: new Date(),
  };
}

/**
 * Fetch RMA report data from database
 * AC3: Optimized SQL aggregations (COUNT, GROUP BY, no SELECT *)
 * AC4: Mandatory tenant filtering
 */
async function fetchRMAReportData(
  tenantId: string,
  mes: number,
  ano: number,
  ctx: { prisma: PrismaClient }
): Promise<RMAReportData> {
  // Calculate start and end dates for the month
  const startDate = new Date(ano, mes - 1, 1); // mes is 1-indexed
  const endDate = new Date(ano, mes, 1); // First day of next month

  // Total atendimentos in month
  const totalAtendimentos = await ctx.prisma.atendimento.count({
    where: {
      tenantId,
      data: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  // Atendimentos por tipo de demanda
  const atendimentosPorTipoDemandaRaw = await ctx.prisma.$queryRaw<
    Array<{ tipoDemanda: string; count: bigint }>
  >`
    SELECT
      "tipoDemanda",
      COUNT(*) as count
    FROM "Atendimento"
    WHERE "tenantId" = ${tenantId}
      AND data >= ${startDate}
      AND data < ${endDate}
    GROUP BY "tipoDemanda"
    ORDER BY count DESC
  `;

  const atendimentosPorTipoDemanda = atendimentosPorTipoDemandaRaw.map(
    (row: { tipoDemanda: string; count: bigint }) => ({
      tipoDemanda: row.tipoDemanda,
      count: Number(row.count),
    })
  );

  // Atendimentos por dia do mês
  const atendimentosPorDiaRaw = await ctx.prisma.$queryRaw<Array<{ dia: number; count: bigint }>>`
    SELECT
      EXTRACT(DAY FROM data)::integer as dia,
      COUNT(*) as count
    FROM "Atendimento"
    WHERE "tenantId" = ${tenantId}
      AND data >= ${startDate}
      AND data < ${endDate}
    GROUP BY EXTRACT(DAY FROM data)
    ORDER BY dia ASC
  `;

  const atendimentosPorDia = atendimentosPorDiaRaw.map((row: { dia: number; count: bigint }) => ({
    dia: row.dia,
    count: Number(row.count),
  }));

  // Total de famílias atendidas (distinct)
  const familiasAtendidasRaw = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT i."id") as count
    FROM "Atendimento" a
    INNER JOIN "Individuo" i ON a."individuoId" = i.id
    INNER JOIN "ComposicaoFamiliar" cf ON i.id = cf."individuoId"
    WHERE a."tenantId" = ${tenantId}
      AND a.data >= ${startDate}
      AND a.data < ${endDate}
  `;

  const totalFamiliasAtendidas = Number(familiasAtendidasRaw[0]?.count || 0);

  // Total de indivíduos atendidos (distinct)
  const individuosAtendidosRaw = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "individuoId") as count
    FROM "Atendimento"
    WHERE "tenantId" = ${tenantId}
      AND data >= ${startDate}
      AND data < ${endDate}
  `;

  const totalIndividuosAtendidos = Number(individuosAtendidosRaw[0]?.count || 0);

  return {
    mes,
    ano,
    totalAtendimentos,
    atendimentosPorTipoDemanda,
    atendimentosPorDia,
    totalFamiliasAtendidas,
    totalIndividuosAtendidos,
  };
}

export const reportingRouter = router({
  /**
   * Dashboard Metrics
   * AC1: Specific endpoint created (dashboard.metrics)
   * AC5: GESTOR-only access via gestorProcedure
   * AC6: Cache with 1-hour TTL
   *
   * Returns aggregated metrics for dashboard display (FR6)
   * - Total atendimentos, familias, individuos
   * - Atendimentos por mês (last 12 months)
   * - Atendimentos por tipo de demanda
   * - Última atualização timestamp
   *
   * Cache strategy:
   * - In-memory cache per function instance
   * - 1-hour TTL
   * - Manual refresh available via frontend button
   */
  dashboard: router({
    metrics: gestorProcedure.query(async ({ ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          // AC4: Tenant filtering via withTenantContext and passed tenantId
          return await getCachedDashboardMetrics(ctx.session.user.tenantId, ctx);
        },
        ctx.session.user.id
      );
    }),
  }),

  /**
   * RMA Report Generation
   * AC1: Specific endpoint created (rma.generate)
   * AC2: Accepts filter parameters (month, year)
   * AC5: GESTOR-only access via gestorProcedure
   *
   * Returns data for Relatório Mensal de Atendimentos (RMA) (FR4)
   * - Total atendimentos in month
   * - Atendimentos por tipo de demanda
   * - Atendimentos por dia
   * - Total famílias atendidas
   * - Total indivíduos atendidos
   *
   * Frontend will use this data to generate PDF/Excel exports (Story 3.3)
   */
  rma: router({
    generate: gestorProcedure
      .input(
        z.object({
          mes: z.number().int().min(1).max(12),
          ano: z.number().int().min(2000).max(2100),
        })
      )
      .query(async ({ input, ctx }) => {
        return await withTenantContext(
          ctx.session.user.tenantId,
          async () => {
            const { mes, ano } = input;

            // Validate month/year is not in the future
            const now = new Date();
            const requestedDate = new Date(ano, mes - 1, 1);

            if (requestedDate > now) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Não é possível gerar relatório para mês/ano futuro",
              });
            }

            // AC4: Tenant filtering via withTenantContext and passed tenantId
            return await fetchRMAReportData(ctx.session.user.tenantId, mes, ano, ctx);
          },
          ctx.session.user.id
        );
      }),
  }),
});
