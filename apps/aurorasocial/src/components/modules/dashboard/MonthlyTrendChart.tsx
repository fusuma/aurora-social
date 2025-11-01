/**
 * MonthlyTrendChart Component
 *
 * Story 3.4: Implementação do Dashboard Gerencial
 *
 * Displays monthly atendimento trends using Recharts
 * - Line chart showing last 12 months
 * - WCAG AA accessibility with descriptive labels
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTrendChartProps {
  data: Array<{
    mes: string; // YYYY-MM format
    count: number;
  }>;
  loading?: boolean;
}

export function MonthlyTrendChart({ data, loading = false }: MonthlyTrendChartProps) {
  if (loading) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        role="status"
        aria-label="Carregando gráfico de tendência mensal"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Carregando gráfico...</p>
        </div>
      </div>
    );
  }

  // Transform data for display (reverse to show oldest first)
  const chartData = [...data].reverse().map((item) => ({
    mes: formatMonthLabel(item.mes),
    atendimentos: item.count,
  }));

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      role="region"
      aria-label="Gráfico de atendimentos por mês nos últimos 12 meses"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Atendimentos por Mês</h2>
      <div
        className="h-80"
        role="img"
        aria-label="Gráfico de linha mostrando tendência de atendimentos"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="mes"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#6b7280" }}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickLine={{ stroke: "#6b7280" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
            />
            <Line
              type="monotone"
              dataKey="atendimentos"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 4 }}
              activeDot={{ r: 6 }}
              name="Atendimentos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length === 0 && (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}

/**
 * Format YYYY-MM to abbreviated month name
 * Example: "2024-10" -> "Out/24"
 */
function formatMonthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split("-");
  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const shortYear = year.slice(2);
  return `${monthNames[monthIndex]}/${shortYear}`;
}
