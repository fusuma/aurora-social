/**
 * Citizen Profile View Page
 *
 * Story 2.3: Implementação da Tela de Visualização de Perfil
 *
 * Features:
 * - Display complete citizen profile (CadÚnico data)
 * - Show family composition
 * - Service history (atendimentos)
 * - Attachments list
 * - Action buttons: Register Visit, Add Attachment, Edit Profile
 * - TÉCNICO and GESTOR access
 * - WCAG AA accessibility
 */

"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { ProfileOverview } from "@/components/modules/citizens/ProfileOverview";
import { AtendimentoHistoryList } from "@/components/modules/citizens/AtendimentoHistoryList";
import { AttachmentList } from "@/components/modules/citizens/AttachmentList";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: citizen, isLoading, error } = trpc.citizens.getProfile.useQuery({ id });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-live="polite"
          aria-label="Carregando perfil"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erro ao carregar perfil</h3>
              <p className="mt-2 text-red-700">{error.message}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data
  if (!citizen) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with breadcrumb and actions */}
      <div className="mb-6">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link
                href="/pesquisar"
                className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                Pesquisa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-gray-900" aria-current="page">
              Perfil do Cidadão
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{citizen.nomeCompleto}</h1>
            <p className="mt-1 text-gray-600">Perfil completo do cidadão</p>
          </div>

          {/* Action Buttons (Story 2.4, 2.5, 2.6) */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/perfil/${id}/registrar-visita`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Registrar Visita
            </Link>

            <Link
              href={`/perfil/${id}/adicionar-anexo`}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              Adicionar Anexo
            </Link>

            <Link
              href={`/perfil/${id}/editar`}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar Perfil
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - 3 sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Overview (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileOverview citizen={citizen} />
        </div>

        {/* Right Column - History and Attachments (1/3 width on large screens) */}
        <div className="lg:col-span-1 space-y-6">
          <AtendimentoHistoryList atendimentos={citizen.atendimentos} citizenId={id} />
          <AttachmentList anexos={citizen.anexos} citizenId={id} />
        </div>
      </div>
    </div>
  );
}
