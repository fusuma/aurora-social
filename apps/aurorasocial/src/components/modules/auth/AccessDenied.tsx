"use client";

import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Acesso Negado</h2>
          <p className="mt-2 text-sm text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Esta área é restrita a usuários com papel de Gestor.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Voltar para Início
          </Link>
          <Link
            href="/pesquisar"
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Ir para Pesquisa
          </Link>
        </div>
      </div>
    </div>
  );
}
