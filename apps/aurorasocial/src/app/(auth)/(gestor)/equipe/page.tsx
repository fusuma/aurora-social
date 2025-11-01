/**
 * User Management Page (GESTOR-only)
 *
 * Story 1.4: Visualização da Página de Gestão de Usuários
 * Story 1.5: Convidar Novo Usuário
 *
 * Displays all users in the current municipality (tenant) with:
 * - List of users with name, email, role, status
 * - Invite user button (GESTOR-only)
 * - Automatic tenant isolation
 * - WCAG AA accessibility
 */

"use client";

import { useState } from "react";
import { UserList } from "@/components/modules/users/UserList";
import { InviteUserModal } from "@/components/modules/users/InviteUserModal";

export default function EquipePage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipe</h1>
            <p className="mt-2 text-gray-600">
              Visualize e gerencie os usuários da sua municipalidade
            </p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
            aria-label="Convidar novo usuário"
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
            Convidar Usuário
          </button>
        </div>
      </div>

      <UserList />

      <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
}
