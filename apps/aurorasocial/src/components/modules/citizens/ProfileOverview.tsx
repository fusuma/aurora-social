/**
 * ProfileOverview Component
 *
 * Story 2.3: Profile View Screen
 *
 * Features:
 * - Display citizen's main registration data (CadÚnico)
 * - Show family composition
 * - Responsive tabs/sections
 * - WCAG AA accessibility
 */

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import type { Individuo, Familia, ComposicaoFamiliar, Sexo, Parentesco } from "@prisma/client";

interface ProfileOverviewProps {
  citizen: Individuo & {
    familias: Array<{
      familia: Familia & {
        responsavel: {
          id: string;
          nomeCompleto: string;
          cpf: string;
        };
        membros: Array<
          ComposicaoFamiliar & {
            individuo: {
              id: string;
              nomeCompleto: string;
              cpf: string;
              dataNascimento: Date;
              sexo: Sexo;
            };
          }
        >;
      };
      parentesco: Parentesco;
    }>;
    familiasResponsavel: Array<
      Familia & {
        membros: Array<
          ComposicaoFamiliar & {
            individuo: {
              id: string;
              nomeCompleto: string;
              cpf: string;
              dataNascimento: Date;
              sexo: Sexo;
            };
          }
        >;
      }
    >;
  };
}

/**
 * Format CPF: 123.456.789-01
 */
function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format currency (BRL)
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Translate Sexo enum to Portuguese
 */
function translateSexo(sexo: Sexo): string {
  const translations: Record<Sexo, string> = {
    MASCULINO: "Masculino",
    FEMININO: "Feminino",
    OUTRO: "Outro",
  };
  return translations[sexo];
}

/**
 * Translate Parentesco enum to Portuguese
 */
function translateParentesco(parentesco: Parentesco): string {
  const translations: Record<Parentesco, string> = {
    RESPONSAVEL: "Responsável",
    CONJUGE: "Cônjuge",
    FILHO: "Filho(a)",
    ENTEADO: "Enteado(a)",
    NETO: "Neto(a)",
    PAI_MAE: "Pai/Mãe",
    SOGRO_SOGRA: "Sogro(a)",
    IRMAO_IRMA: "Irmão/Irmã",
    GENRO_NORA: "Genro/Nora",
    OUTRO: "Outro",
  };
  return translations[parentesco];
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function ProfileOverview({ citizen }: ProfileOverviewProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "family">("personal");

  // Get primary family (where citizen is member or responsible)
  const isResponsavel = citizen.familiasResponsavel.length > 0;
  const primaryFamilyData = isResponsavel
    ? citizen.familiasResponsavel[0]
    : citizen.familias[0]?.familia;

  // Get responsible person data
  const responsavelData = isResponsavel
    ? { nomeCompleto: citizen.nomeCompleto, cpf: citizen.cpf }
    : citizen.familias[0]?.familia.responsavel;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Seções do perfil">
          <button
            onClick={() => setActiveTab("personal")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t ${
              activeTab === "personal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
            aria-current={activeTab === "personal" ? "page" : undefined}
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t ${
              activeTab === "family"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
            aria-current={activeTab === "family" ? "page" : undefined}
          >
            Composição Familiar
          </button>
        </nav>
      </div>

      {/* Personal Data Tab */}
      {activeTab === "personal" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Pessoais (CadÚnico)</h2>

          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Nome Completo */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
              <dd className="mt-1 text-base font-semibold text-gray-900">{citizen.nomeCompleto}</dd>
            </div>

            {/* CPF */}
            <div>
              <dt className="text-sm font-medium text-gray-500">CPF</dt>
              <dd className="mt-1 text-base text-gray-900">{formatCPF(citizen.cpf)}</dd>
            </div>

            {/* Data de Nascimento */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
              <dd className="mt-1 text-base text-gray-900">
                {format(new Date(citizen.dataNascimento), "dd/MM/yyyy", { locale: ptBR })}
                <span className="ml-2 text-sm text-gray-600">
                  ({calculateAge(citizen.dataNascimento)} anos)
                </span>
              </dd>
            </div>

            {/* Sexo */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Sexo</dt>
              <dd className="mt-1 text-base text-gray-900">{translateSexo(citizen.sexo)}</dd>
            </div>

            {/* NIS */}
            {citizen.nis && (
              <div>
                <dt className="text-sm font-medium text-gray-500">NIS (CadÚnico)</dt>
                <dd className="mt-1 text-base text-gray-900">{citizen.nis}</dd>
              </div>
            )}

            {/* Nome da Mãe */}
            {citizen.nomeMae && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome da Mãe</dt>
                <dd className="mt-1 text-base text-gray-900">{citizen.nomeMae}</dd>
              </div>
            )}

            {/* RG */}
            {citizen.rg && (
              <div>
                <dt className="text-sm font-medium text-gray-500">RG</dt>
                <dd className="mt-1 text-base text-gray-900">{citizen.rg}</dd>
              </div>
            )}

            {/* Título de Eleitor */}
            {citizen.tituloEleitor && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Título de Eleitor</dt>
                <dd className="mt-1 text-base text-gray-900">{citizen.tituloEleitor}</dd>
              </div>
            )}

            {/* Carteira de Trabalho */}
            {citizen.carteiraTrabalho && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Carteira de Trabalho</dt>
                <dd className="mt-1 text-base text-gray-900">{citizen.carteiraTrabalho}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Family Composition Tab */}
      {activeTab === "family" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Composição Familiar</h2>

          {primaryFamilyData ? (
            <div className="space-y-6">
              {/* Family Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pb-6 border-b border-gray-200">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Endereço Familiar</dt>
                  <dd className="mt-1 text-base text-gray-900">{primaryFamilyData.endereco}</dd>
                </div>

                {primaryFamilyData.rendaFamiliarTotal && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Renda Familiar Total</dt>
                    <dd className="mt-1 text-base font-semibold text-gray-900">
                      {formatCurrency(Number(primaryFamilyData.rendaFamiliarTotal))}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500">Responsável Familiar</dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {responsavelData?.nomeCompleto}
                    <span className="ml-2 text-sm text-gray-600">
                      {isResponsavel ? "(Você)" : `(CPF: ${formatCPF(responsavelData?.cpf || "")})`}
                    </span>
                  </dd>
                </div>
              </div>

              {/* Family Members */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Membros da Família ({primaryFamilyData.membros.length})
                </h3>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200" role="table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Nome
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Parentesco
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Idade
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Sexo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {primaryFamilyData.membros.map((membro) => (
                        <tr key={membro.id} className="hover:bg-gray-50 transition-colors">
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                            {membro.individuo.nomeCompleto}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                            {translateParentesco(membro.parentesco)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                            {calculateAge(membro.individuo.dataNascimento)} anos
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                            {translateSexo(membro.individuo.sexo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma família cadastrada</h3>
              <p className="mt-2 text-gray-600">
                Este cidadão ainda não possui composição familiar cadastrada.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
