/**
 * RmaReportPreview Component
 *
 * Story 3.2 - AC3, AC4, AC5, AC7:
 * - AC3: Loading indicator during report generation
 * - AC4: Display data according to RMA layout with correct formatting
 * - AC5: Export buttons for PDF and Excel (Story 3.3)
 * - AC7: User-friendly error messages
 *
 * Features:
 * - Calls reporting.rma.generate() API (Story 3.1)
 * - Loading state with clear indicator
 * - Error handling with user-friendly messages
 * - RMA data display with proper formatting
 * - Export buttons (functionality in Story 3.3)
 * - WCAG AA accessibility
 */

"use client";

import { trpc } from "@/lib/trpc/client";

interface RmaReportPreviewProps {
  mes: number;
  ano: number;
}

export function RmaReportPreview({ mes, ano }: RmaReportPreviewProps) {
  // AC3: Call API with loading state
  const {
    data: reportData,
    isLoading,
    error,
  } = trpc.reporting.rma.generate.useQuery(
    { mes, ano },
    {
      // Keep data fresh on period change
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  // Month names for display
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

  // AC3: Loading indicator
  if (isLoading) {
    return (
      <div
        className="mt-8 rounded-lg border border-gray-200 bg-white p-12 shadow-sm"
        role="status"
        aria-live="polite"
        aria-label="Gerando relatório"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-900">Gerando relatório...</p>
          <p className="text-sm text-gray-600">Aguarde enquanto os dados são processados</p>
        </div>
      </div>
    );
  }

  // AC7: User-friendly error messages
  if (error) {
    return (
      <div
        className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-red-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900">
              Não foi possível gerar o relatório
            </h3>
            <p className="mt-2 text-red-700">
              {error.message || "Erro desconhecido. Por favor, tente novamente."}
            </p>
            <p className="mt-2 text-sm text-red-600">
              Se o problema persistir, entre em contato com o suporte técnico.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data case
  if (!reportData) {
    return null;
  }

  // AC4: Display data according to RMA layout
  return (
    <div className="mt-8 space-y-6">
      {/* Report Header - AC4 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Relatório Mensal de Atendimentos (RMA)
            </h2>
            <p className="mt-2 text-gray-600">
              Período: {monthNames[mes - 1]} de {ano}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Relatório oficial obrigatório conforme SUAS
            </p>
          </div>

          {/* AC5: Export buttons for Story 3.3 */}
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
              aria-label="Exportar para PDF"
              title="Funcionalidade será implementada na História 3.3"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Exportar PDF
            </button>
            <button
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
              aria-label="Exportar para Excel"
              title="Funcionalidade será implementada na História 3.3"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - AC4 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total de Atendimentos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{reportData.totalAtendimentos}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Famílias Atendidas</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reportData.totalFamiliasAtendidas}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Indivíduos Atendidos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reportData.totalIndividuosAtendidos}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Média Diária</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reportData.atendimentosPorDia.length > 0
              ? Math.round(reportData.totalAtendimentos / reportData.atendimentosPorDia.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Atendimentos por Tipo de Demanda - AC4 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Atendimentos por Tipo de Demanda
        </h3>

        {reportData.atendimentosPorTipoDemanda.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum atendimento registrado no período</p>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Tipo de Demanda
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Quantidade
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Percentual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reportData.atendimentosPorTipoDemanda.map((item, index) => {
                  const percentage =
                    reportData.totalAtendimentos > 0
                      ? ((item.count / reportData.totalAtendimentos) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.tipoDemanda}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {reportData.totalAtendimentos}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Atendimentos por Dia - AC4 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atendimentos por Dia do Mês</h3>

        {reportData.atendimentosPorDia.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum atendimento registrado no período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Dia
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Atendimentos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reportData.atendimentosPorDia.map((item) => (
                  <tr key={item.dia} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Dia {item.dia}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Integrity Notice - AC4 */}
      <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 border border-green-100">
        <svg
          className="h-5 w-5 text-green-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-green-900">
          <strong>Integridade de Dados:</strong> Os totais e dados exibidos acima são idênticos aos
          que serão exportados em PDF/Excel.
        </p>
      </div>
    </div>
  );
}
