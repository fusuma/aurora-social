/**
 * DashboardContent Component (Client)
 *
 * Story 3.4: Implementação do Dashboard Gerencial
 *
 * Client component that fetches and displays dashboard metrics:
 * - Uses tRPC to query reporting.dashboard.metrics
 * - Displays KPI cards, charts, and last updated time
 * - Manual refresh button with loading state
 * - Error handling with user-friendly messages
 */

"use client";

import { trpc } from "@/lib/trpc/client";
import { DashboardKpiCard } from "@/components/modules/dashboard/DashboardKpiCard";
import { MonthlyTrendChart } from "@/components/modules/dashboard/MonthlyTrendChart";
import { DemandTypeChart } from "@/components/modules/dashboard/DemandTypeChart";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DashboardContent() {
  const {
    data: metrics,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = trpc.reporting.dashboard.metrics.useQuery(undefined, {
    // Respect 1-hour cache from API
    staleTime: 3600000, // 1 hour in milliseconds
    refetchOnWindowFocus: false,
  });

  // Manual refresh handler
  const handleRefresh = () => {
    refetch();
  };

  // Error state (AC7)
  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                Erro ao carregar métricas do dashboard
              </h3>
              <p className="mt-2 text-red-700">
                Não foi possível carregar as métricas no momento. Por favor, tente novamente mais
                tarde.
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                aria-label="Tentar novamente"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with refresh button */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Gerencial</h1>
          <p className="mt-2 text-gray-600">Visão geral das métricas-chave da sua operação</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors sm:self-auto"
          aria-label="Atualizar dashboard"
        >
          <svg
            className={`h-5 w-5 ${isRefetching ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefetching ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* Last updated timestamp (AC3) */}
      {metrics?.ultimaAtualizacao && !isLoading && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3" role="status">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Última atualização:</span>{" "}
            {format(new Date(metrics.ultimaAtualizacao), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
        </div>
      )}

      {/* KPI Cards (AC2) */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardKpiCard
          title="Total de Atendimentos"
          value={metrics?.totalAtendimentos ?? 0}
          loading={isLoading}
          icon={
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
          ariaLabel={`Total de atendimentos: ${metrics?.totalAtendimentos ?? 0}`}
        />
        <DashboardKpiCard
          title="Total de Famílias"
          value={metrics?.totalFamilias ?? 0}
          loading={isLoading}
          icon={
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
          ariaLabel={`Total de famílias: ${metrics?.totalFamilias ?? 0}`}
        />
        <DashboardKpiCard
          title="Total de Indivíduos"
          value={metrics?.totalIndividuos ?? 0}
          loading={isLoading}
          icon={
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          ariaLabel={`Total de indivíduos: ${metrics?.totalIndividuos ?? 0}`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart data={metrics?.atendimentosPorMes ?? []} loading={isLoading} />
        <DemandTypeChart data={metrics?.atendimentosPorTipoDemanda ?? []} loading={isLoading} />
      </div>
    </div>
  );
}
