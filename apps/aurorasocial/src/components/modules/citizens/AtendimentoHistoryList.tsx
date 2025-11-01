/**
 * AtendimentoHistoryList Component
 *
 * Story 2.3: Profile View Screen
 *
 * Features:
 * - Display summary list of recent visits (atendimentos)
 * - Show: Date, Demand Type, Técnico
 * - Link to full history view
 * - WCAG AA accessibility
 */

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import type { Atendimento, TipoDemanda, Role } from "@prisma/client";

interface AtendimentoHistoryListProps {
  atendimentos: Array<
    Atendimento & {
      usuario: {
        id: string;
        name: string;
        role: Role;
      };
    }
  >;
  citizenId: string;
  onRegisterClick?: () => void;
}

/**
 * Translate TipoDemanda enum to Portuguese
 */
function translateTipoDemanda(tipo: TipoDemanda): string {
  const translations: Record<TipoDemanda, string> = {
    BENEFICIO_EVENTUAL: "Benefício Eventual",
    CADASTRO_UNICO: "Cadastro Único",
    BPC: "BPC",
    BOLSA_FAMILIA: "Bolsa Família",
    ORIENTACAO_SOCIAL: "Orientação Social",
    ENCAMINHAMENTO_SAUDE: "Encaminhamento Saúde",
    ENCAMINHAMENTO_EDUCACAO: "Encaminhamento Educação",
    VIOLACAO_DIREITOS: "Violação de Direitos",
    OUTRO: "Outro",
  };
  return translations[tipo];
}

/**
 * Get color class for demand type badge
 */
function getDemandTypeColor(tipo: TipoDemanda): string {
  const colors: Record<TipoDemanda, string> = {
    BENEFICIO_EVENTUAL: "bg-green-100 text-green-800",
    CADASTRO_UNICO: "bg-blue-100 text-blue-800",
    BPC: "bg-purple-100 text-purple-800",
    BOLSA_FAMILIA: "bg-yellow-100 text-yellow-800",
    ORIENTACAO_SOCIAL: "bg-indigo-100 text-indigo-800",
    ENCAMINHAMENTO_SAUDE: "bg-pink-100 text-pink-800",
    ENCAMINHAMENTO_EDUCACAO: "bg-cyan-100 text-cyan-800",
    VIOLACAO_DIREITOS: "bg-red-100 text-red-800",
    OUTRO: "bg-gray-100 text-gray-800",
  };
  return colors[tipo];
}

export function AtendimentoHistoryList({
  atendimentos,
  citizenId,
  onRegisterClick,
}: AtendimentoHistoryListProps) {
  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-labelledby="history-title"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="history-title" className="text-lg font-semibold text-gray-900">
          Histórico de Atendimentos
        </h2>
        {atendimentos.length > 0 && (
          <Link
            href={`/perfil/${citizenId}/historico`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            Ver Tudo
          </Link>
        )}
      </div>

      {atendimentos.length > 0 ? (
        <div className="space-y-4">
          {/* Summary List */}
          <ul className="space-y-3" role="list">
            {atendimentos.map((atendimento) => (
              <li
                key={atendimento.id}
                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Date */}
                    <time
                      dateTime={atendimento.data.toISOString()}
                      className="text-sm font-medium text-gray-900"
                    >
                      {format(new Date(atendimento.data), "dd/MM/yyyy", { locale: ptBR })}
                    </time>

                    {/* Demand Type Badge */}
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDemandTypeColor(
                          atendimento.tipoDemanda
                        )}`}
                      >
                        {translateTipoDemanda(atendimento.tipoDemanda)}
                      </span>
                    </div>

                    {/* Técnico */}
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Técnico:</span> {atendimento.usuario.name}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <svg
                    className="h-5 w-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </li>
            ))}
          </ul>

          {/* Show count */}
          <p className="text-sm text-gray-600 text-center pt-2 border-t border-gray-200">
            Mostrando {Math.min(atendimentos.length, 10)} atendimento
            {atendimentos.length !== 1 ? "s" : ""} mais recente
            {atendimentos.length !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
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
          <h3 className="mt-3 text-sm font-medium text-gray-900">Nenhum atendimento</h3>
          <p className="mt-1 text-sm text-gray-600">
            Este cidadão ainda não possui atendimentos registrados.
          </p>
          {onRegisterClick && (
            <div className="mt-4">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Registrar Primeira Visita
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
