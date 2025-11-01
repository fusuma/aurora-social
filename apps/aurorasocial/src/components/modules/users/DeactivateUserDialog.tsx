/**
 * DeactivateUserDialog Component
 *
 * Story 1.6: Desativar Usuário
 *
 * Confirmation dialog for deactivating a user account
 * - LGPD-compliant immediate access revocation
 * - Clear warning message
 * - Optimistic UI update on success
 */

"use client";

import { trpc } from "@/lib/trpc/client";

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface DeactivateUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateUserDialog({ user, open, onOpenChange }: DeactivateUserDialogProps) {
  const utils = trpc.useContext();
  const mutation = trpc.users.deactivate.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      onOpenChange(false);
    },
  });

  if (!user) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}
      {open && (
        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Desativar usuário?</h2>
            <p className="mt-2 text-sm text-gray-600">
              <strong>{user.name}</strong> ({user.email}) perderá acesso imediatamente ao sistema.
              Esta ação pode ser revertida posteriormente.
            </p>
            <p className="mt-2 text-sm text-red-600">
              Todas as sessões ativas serão encerradas e o usuário não poderá mais fazer login.
            </p>
          </div>

          {mutation.error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3" role="alert">
              <p className="text-sm text-red-800">{mutation.error.message}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate({ userId: user.id })}
              disabled={mutation.isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {mutation.isPending ? "Desativando..." : "Desativar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
