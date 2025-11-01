/**
 * ReportSelector Component
 *
 * Story 3.2 - AC2: Interface to select report type (RMA) and period (month/year)
 *
 * Features:
 * - Report type selector (RMA only for now)
 * - Month and year dropdowns
 * - Form validation (no future dates)
 * - WCAG AA accessibility
 * - Clear labels and instructions
 */

"use client";

import { useState, useEffect } from "react";

interface ReportSelectorProps {
  onPeriodChange: (period: { mes: number; ano: number } | null) => void;
}

export function ReportSelector({ onPeriodChange }: ReportSelectorProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-indexed
  const currentYear = currentDate.getFullYear();

  const [reportType, setReportType] = useState<"RMA">("RMA");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Month names in Portuguese
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Trigger period change when selection changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      onPeriodChange({ mes: selectedMonth, ano: selectedYear });
    }
  }, [selectedMonth, selectedYear, onPeriodChange]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Selecionar Relatório e Período</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Type Selector - AC2 */}
        <div>
          <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Relatório
          </label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as "RMA")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Selecionar tipo de relatório"
          >
            <option value="RMA">RMA - Relatório Mensal de Atendimentos</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">Relatório oficial obrigatório (SUAS)</p>
        </div>

        {/* Month Selector - AC2 */}
        <div>
          <label htmlFor="report-month" className="block text-sm font-medium text-gray-700 mb-2">
            Mês
          </label>
          <select
            id="report-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Selecionar mês do relatório"
          >
            {monthNames.map((name, index) => {
              const monthValue = index + 1;
              // Disable future months in current year
              const isFuture = selectedYear === currentYear && monthValue > currentMonth;

              return (
                <option key={monthValue} value={monthValue} disabled={isFuture}>
                  {name}
                  {isFuture ? " (futuro)" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Year Selector - AC2 */}
        <div>
          <label htmlFor="report-year" className="block text-sm font-medium text-gray-700 mb-2">
            Ano
          </label>
          <select
            id="report-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Selecionar ano do relatório"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="mt-6 flex items-center gap-2 rounded-md bg-blue-50 px-4 py-3 border border-blue-100">
        <svg
          className="h-5 w-5 text-blue-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-blue-900">
          <strong>Período selecionado:</strong> {monthNames[selectedMonth - 1]} de {selectedYear}
        </p>
      </div>
    </div>
  );
}
