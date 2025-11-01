/**
 * Invite User Modal Component
 *
 * Story 1.5: Convidar Novo Usuário
 *
 * Modal dialog for inviting new users to the municipality.
 * GESTOR-only functionality with email and role selection.
 * WCAG AA accessible with keyboard navigation support.
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { Role } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("TECNICO");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const utils = trpc.useUtils();
  const inviteMutation = trpc.users.invite.useMutation({
    onSuccess: () => {
      // Invalidate users list to show new user
      utils.users.list.invalidate();

      // Close modal and reset form
      handleClose();
    },
    onError: (error) => {
      setGeneralError(error.message);
    },
  });

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("O email é obrigatório");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Digite um email válido");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateEmail(email)) {
      return;
    }

    inviteMutation.mutate({
      email: email.trim().toLowerCase(),
      role,
    });
  };

  const handleClose = () => {
    setEmail("");
    setRole("TECNICO");
    setEmailError("");
    setGeneralError("");
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !inviteMutation.isLoading) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, inviteMutation.isLoading]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-user-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !inviteMutation.isLoading) {
          handleClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="invite-user-title" className="text-xl font-semibold text-gray-900">
              Convidar Usuário
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={inviteMutation.isLoading}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fechar modal"
            >
              <svg
                className="h-6 w-6"
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
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4" noValidate>
          {/* General Error */}
          {generalError && (
            <div
              className="mb-4 rounded-md border border-red-200 bg-red-50 p-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{generalError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {inviteMutation.isSuccess && (
            <div
              className="mb-4 rounded-md border border-green-200 bg-green-50 p-4"
              role="status"
              aria-live="polite"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Convite enviado com sucesso! O usuário receberá um email para configurar sua
                    conta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              disabled={inviteMutation.isLoading}
              className={`
                w-full rounded-md border px-3 py-2 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  emailError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-600"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-600"
                }
              `}
              placeholder="usuario@exemplo.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              required
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Papel <span className="text-red-600">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={inviteMutation.isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="TECNICO">Técnico</option>
              <option value="GESTOR">Gestor</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              O papel define as permissões do usuário no sistema
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={inviteMutation.isLoading}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isLoading}
              className="flex-1 flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-busy={inviteMutation.isLoading}
            >
              {inviteMutation.isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                "Enviar Convite"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
