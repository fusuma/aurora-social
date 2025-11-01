/**
 * DemandTypeChart Component
 *
 * Story 3.4: Implementação do Dashboard Gerencial
 *
 * Displays atendimentos by tipo de demanda using Recharts
 * - Bar chart showing demand types distribution
 * - WCAG AA accessibility with descriptive labels
 */

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DemandTypeChartProps {
  data: Array<{
    tipoDemanda: string;
    count: number;
  }>;
  loading?: boolean;
}

export function DemandTypeChart({ data, loading = false }: DemandTypeChartProps) {
  if (loading) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        role="status"
        aria-label="Carregando gráfico de tipos de demanda"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Carregando gráfico...</p>
        </div>
      </div>
    );
  }

  // Transform data for display (limit to top 10)
  const chartData = data.slice(0, 10).map((item) => ({
    tipo: truncateLabel(item.tipoDemanda, 20),
    atendimentos: item.count,
  }));

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      role="region"
      aria-label="Gráfico de atendimentos por tipo de demanda"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Atendimentos por Tipo de Demanda</h2>
      <div
        className="h-80"
        role="img"
        aria-label="Gráfico de barras mostrando distribuição por tipo de demanda"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="tipo"
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: "#6b7280" }}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Bar dataKey="atendimentos" fill="#2563eb" radius={[4, 4, 0, 0]} name="Atendimentos" />
          </BarChart>
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
 * Truncate long labels to fit in chart
 */
function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength - 3) + "...";
}
