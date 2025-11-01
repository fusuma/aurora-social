/**
 * CitizenSearch Component
 *
 * Story 2.2: Citizen Search Screen
 *
 * Features:
 * - Debounced search input (300ms)
 * - Search by name, CPF, or NIS
 * - Loading states
 * - Empty state with "Create New Profile" link
 * - WCAG AA accessibility
 */

"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { CitizenSearchResults } from "./CitizenSearchResults";

export function CitizenSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only query if debounced query is not empty
  const { data, isLoading, error, isFetching } = trpc.citizens.search.useQuery(
    {
      query: debouncedQuery,
      page,
      limit: 20,
    },
    {
      enabled: debouncedQuery.length > 0,
      keepPreviousData: true, // Keep previous results while fetching new page
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative" role="search">
        <label htmlFor="citizen-search" className="sr-only">
          Pesquisar cidadão por nome, CPF ou NIS
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="citizen-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            placeholder="Digite o nome, CPF ou NIS do cidadão..."
            autoComplete="off"
            aria-describedby="search-description"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
              aria-label="Limpar busca"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <p id="search-description" className="mt-2 text-sm text-gray-600">
          A busca é rápida e tolerante a erros de digitação. Você pode pesquisar por nome (completo
          ou parcial), CPF ou NIS.
        </p>
      </form>

      {/* Loading State (initial search) */}
      {isLoading && debouncedQuery && (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-live="polite"
          aria-label="Pesquisando cidadãos"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Pesquisando...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-6"
          role="alert"
          aria-live="assertive"
        >
          <h3 className="text-lg font-semibold text-red-900">Erro ao pesquisar</h3>
          <p className="mt-2 text-red-700">{error.message}</p>
        </div>
      )}

      {/* Empty State - No Search Yet */}
      {!debouncedQuery && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Pesquise por um cidadão</h3>
          <p className="mt-2 text-gray-600">
            Digite o nome, CPF ou NIS no campo acima para começar a busca.
          </p>
        </div>
      )}

      {/* Empty State - No Results */}
      {debouncedQuery && data && data.citizens.length === 0 && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
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
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum perfil encontrado</h3>
          <p className="mt-2 text-gray-600">
            Não encontramos nenhum cidadão com &ldquo;{debouncedQuery}&rdquo;.
          </p>
          <div className="mt-6">
            <a
              href="/criar-perfil"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Criar Novo Perfil
            </a>
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQuery && data && data.citizens.length > 0 && (
        <CitizenSearchResults
          citizens={data.citizens}
          pagination={data.pagination}
          currentPage={page}
          onPageChange={setPage}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}
