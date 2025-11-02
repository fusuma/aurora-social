/**
 * Citizen Search Page (TÉCNICO-accessible)
 *
 * Story 2.2: Implementação da Tela de Pesquisa de Cidadão
 *
 * Features:
 * - Search citizens by name, CPF, or NIS
 * - Fast and forgiving search (accent-insensitive, case-insensitive)
 * - Tenant-isolated results (NFR2, NFR5)
 * - Direct navigation to profile (Story 2.3)
 * - "Create New Profile" link when no results (Story 2.4)
 * - WCAG AA accessibility
 */

"use client";

import { CitizenSearch } from "@/components/modules/citizens/CitizenSearch";

export default function PesquisarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pesquisa de Cidadãos</h1>
        <p className="mt-2 text-gray-600">
          Busque por cidadãos cadastrados no sistema usando nome, CPF ou NIS.
        </p>
      </div>

      <CitizenSearch />
    </div>
  );
}
