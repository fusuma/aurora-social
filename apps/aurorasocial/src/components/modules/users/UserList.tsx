/**
 * UserList Component
 *
 * Displays list of users in current tenant with:
 * - Table view with sorting
 * - User details (name, email, role, status)
 * - Loading and empty states
 * - WCAG AA accessibility
 * - Responsive design (cards on mobile)
 * - Deactivate/Reactivate actions (Story 1.6)
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";
import { DeactivateUserDialog } from "./DeactivateUserDialog";
import { ReactivateUserDialog } from "./ReactivateUserDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UserList() {
  const { data: users = [], isLoading, error } = trpc.users.list.useQuery();
  const [deactivateUser, setDeactivateUser] = useState<typeof users[number] | null>(null);
  const [reactivateUser, setReactivateUser] = useState<typeof users[number] | null>(null);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
        aria-label="Carregando lista de usuários"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6"
        role="alert"
        aria-live="assertive"
      >
        <h3 className="text-lg font-semibold text-red-900">Erro ao carregar usuários</h3>
        <p className="mt-2 text-red-700">{error.message}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum usuário encontrado</h3>
        <p className="mt-2 text-gray-600">Não há usuários cadastrados nesta municipalidade.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Papel
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Cadastrado em
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  {user.status === "ACTIVE" ? (
                    <button
                      onClick={() => setDeactivateUser(user)}
                      className="text-red-600 hover:text-red-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                      aria-label={`Desativar ${user.name}`}
                    >
                      Desativar
                    </button>
                  ) : user.status === "INACTIVE" ? (
                    <button
                      onClick={() => setReactivateUser(user)}
                      className="text-green-600 hover:text-green-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-2 py-1"
                      aria-label={`Reativar ${user.name}`}
                    >
                      Reativar
                    </button>
                  ) : (
                    <span className="text-gray-400">Pendente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              </div>
              <UserStatusBadge status={user.status} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <UserRoleBadge role={user.role} />
              <span className="text-xs text-gray-500">
                Cadastrado em {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="mt-3">
              {user.status === "ACTIVE" ? (
                <button
                  onClick={() => setDeactivateUser(user)}
                  className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Desativar ${user.name}`}
                >
                  Desativar
                </button>
              ) : user.status === "INACTIVE" ? (
                <button
                  onClick={() => setReactivateUser(user)}
                  className="w-full rounded-md border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label={`Reativar ${user.name}`}
                >
                  Reativar
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Count Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">{users.length}</span> usuário
          {users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Dialogs */}
      <DeactivateUserDialog
        user={deactivateUser}
        open={!!deactivateUser}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
      />
      <ReactivateUserDialog
        user={reactivateUser}
        open={!!reactivateUser}
        onOpenChange={(open) => !open && setReactivateUser(null)}
      />
    </div>
  );
}
