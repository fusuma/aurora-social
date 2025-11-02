/**
 * Reports Page (GESTOR-only)
 *
 * Story 3.2: Implementação da Página de Geração de Relatórios (RMA)
 *
 * Allows GESTOR users to:
 * - Select report type (RMA)
 * - Choose period (month/year)
 * - Generate and view report data
 * - Export to PDF/Excel (Story 3.3 - buttons only)
 *
 * AC1: Page accessible (GESTOR only) via (gestor) layout
 * AC2: Interface allows selection of report type (RMA) and period (month/year)
 * AC3: Loading indicator during generation
 * AC4: Display data according to RMA layout
 * AC5: Export buttons displayed (for Story 3.3)
 * AC6: WCAG AA compliance and Clear Governance vision
 * AC7: User-friendly error messages
 */

"use client";

import { useState } from "react";
import { ReportSelector } from "@/components/modules/reports/ReportSelector";
import { RmaReportPreview } from "@/components/modules/reports/RmaReportPreview";

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<{ mes: number; ano: number } | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Geração de Relatórios</h1>
        <p className="mt-2 text-gray-600">
          Gere e exporte relatórios oficiais de atendimentos (RMA)
        </p>
      </div>

      {/* Report Type and Period Selection - AC2 */}
      <ReportSelector onPeriodChange={setSelectedPeriod} />

      {/* Report Preview - AC3, AC4, AC5, AC7 */}
      {selectedPeriod && <RmaReportPreview mes={selectedPeriod.mes} ano={selectedPeriod.ano} />}
    </div>
  );
}
