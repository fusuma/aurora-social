/**
 * User Management Page (GESTOR-only)
 *
 * Story 1.4: Visualização da Página de Gestão de Usuários
 *
 * Displays all users in the current municipality (tenant) with:
 * - List of users with name, email, role, status
 * - Automatic tenant isolation
 * - WCAG AA accessibility
 */

import { UserList } from "@/components/modules/users/UserList";

export default function EquipePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipe</h1>
        <p className="mt-2 text-gray-600">Visualize todos os usuários da sua municipalidade</p>
      </div>

      <UserList />
    </div>
  );
}

export const metadata = {
  title: "Gestão de Equipe | Aurora Social",
  description: "Gerenciamento de usuários da municipalidade",
};
