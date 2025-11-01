/**
 * DashboardKpiCard Component
 *
 * Story 3.4: Implementação do Dashboard Gerencial
 *
 * Displays a single KPI metric card with:
 * - Title and value
 * - Icon
 * - Trend indicator (optional)
 * - WCAG AA accessibility
 */

interface DashboardKpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
  ariaLabel?: string;
}

export function DashboardKpiCard({
  title,
  value,
  icon,
  loading = false,
  ariaLabel,
}: DashboardKpiCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        role="status"
        aria-label={ariaLabel || `Carregando ${title}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
      role="region"
      aria-label={ariaLabel || `${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600" id={`kpi-title-${title}`}>
            {title}
          </p>
          <p
            className="mt-2 text-3xl font-bold text-gray-900"
            aria-describedby={`kpi-title-${title}`}
          >
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50"
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
