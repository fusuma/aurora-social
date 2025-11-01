/**
 * CitizenSearchResults Component
 *
 * Story 2.2: Citizen Search Screen
 *
 * Features:
 * - Display search results in table (desktop) and cards (mobile)
 * - Show minimum info: Full Name, CPF, Birth Date
 * - Click to navigate to profile (Story 2.3)
 * - Pagination controls
 * - WCAG AA accessibility
 */

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface Citizen {
  id: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: Date;
  nis: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CitizenSearchResultsProps {
  citizens: Citizen[];
  pagination: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Format CPF: 123.456.789-01
 */
function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function CitizenSearchResults({
  citizens,
  pagination,
  currentPage,
  onPageChange,
  isLoading = false,
}: CitizenSearchResultsProps) {
  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Encontrado{pagination.total !== 1 ? "s" : ""}{" "}
          <span className="font-semibold">{pagination.total}</span> cidadão
          {pagination.total !== 1 ? "s" : ""}
        </p>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span>Carregando...</span>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Nome Completo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                CPF
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Data de Nascimento
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                NIS
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {citizens.map((citizen) => (
              <tr key={citizen.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{citizen.nomeCompleto}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-600">{formatCPF(citizen.cpf)}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {format(new Date(citizen.dataNascimento), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {citizen.nis || "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <Link
                    href={`/perfil/${citizen.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    aria-label={`Ver perfil de ${citizen.nomeCompleto}`}
                  >
                    Ver Perfil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {citizens.map((citizen) => (
          <Link
            key={citizen.id}
            href={`/perfil/${citizen.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Ver perfil de ${citizen.nomeCompleto}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {citizen.nomeCompleto}
                </h3>
                <dl className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <dt className="text-gray-500">CPF:</dt>
                    <dd className="text-gray-900">{formatCPF(citizen.cpf)}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <dt className="text-gray-500">Nascimento:</dt>
                    <dd className="text-gray-900">
                      {format(new Date(citizen.dataNascimento), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </dd>
                  </div>
                  {citizen.nis && (
                    <div className="flex items-center gap-2 text-sm">
                      <dt className="text-gray-500">NIS:</dt>
                      <dd className="text-gray-900">{citizen.nis}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="ml-4">
                <svg
                  className="h-5 w-5 text-gray-400"
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
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg"
          aria-label="Paginação"
        >
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Próxima página"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{" "}
                de <span className="font-medium">{pagination.total}</span> resultado
                {pagination.total !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Paginação"
              >
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Página anterior"
                >
                  <span className="sr-only">Anterior</span>
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and adjacent pages
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="inline-flex">
                        {showEllipsis && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => onPageChange(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            page === currentPage
                              ? "z-10 border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                          aria-label={`Página ${page}`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Próxima página"
                >
                  <span className="sr-only">Próxima</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 24 24"
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
                </button>
              </nav>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
