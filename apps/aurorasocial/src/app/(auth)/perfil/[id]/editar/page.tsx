/**
 * Edit Citizen Profile Page
 *
 * Story 2.4: Create/Edit Profile
 *
 * Features:
 * - Edit existing citizen CadÚnico data
 * - CPF uniqueness validation (if changed)
 * - Audit trail (updatedAt tracked automatically)
 * - TÉCNICO and GESTOR access
 * - WCAG AA accessibility
 */

"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProfileForm } from "@/components/modules/citizens/ProfileForm";
import Link from "next/link";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing citizen data
  const { data: citizen, isLoading, error: loadError } = trpc.citizens.getProfile.useQuery({ id });

  const updateMutation = trpc.citizens.updateCitizen.useMutation({
    onSuccess: () => {
      // Redirect back to profile view
      router.push(`/perfil/${id}`);
    },
    onError: (error) => {
      setError(error.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (formData: {
    nomeCompleto: string;
    cpf: string;
    dataNascimento: Date;
    sexo: "MASCULINO" | "FEMININO" | "OUTRO";
    nomeMae?: string;
    nis?: string;
    rg?: string;
    tituloEleitor?: string;
    carteiraTrabalho?: string;
    createAsResponsavel: boolean;
    endereco?: string;
    rendaFamiliarTotal?: number;
  }) => {
    setIsSubmitting(true);
    setError(null);

    // Normalize CPF and NIS (digits only)
    const normalizedData = {
      id,
      nomeCompleto: formData.nomeCompleto,
      cpf: formData.cpf.replace(/\D/g, ""),
      dataNascimento: formData.dataNascimento,
      sexo: formData.sexo,
      nomeMae: formData.nomeMae,
      nis: formData.nis ? formData.nis.replace(/\D/g, "") : undefined,
      rg: formData.rg,
      tituloEleitor: formData.tituloEleitor,
      carteiraTrabalho: formData.carteiraTrabalho,
    };

    updateMutation.mutate(normalizedData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-live="polite"
          aria-label="Carregando perfil"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !citizen) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-4">
            <svg
              className="h-6 w-6 text-red-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erro ao carregar perfil</h3>
              <p className="mt-2 text-red-700">{loadError?.message || "Cidadão não encontrado"}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link
                href="/pesquisar"
                className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                Pesquisa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/perfil/${id}`}
                className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                Perfil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-gray-900" aria-current="page">
              Editar
            </li>
          </ol>
        </nav>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil de Cidadão</h1>
          <p className="mt-2 text-gray-600">
            Atualize os dados do cidadão. As alterações serão registradas no histórico de auditoria.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Erro ao atualizar perfil</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <ProfileForm
          mode="edit"
          initialData={citizen}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push(`/perfil/${id}`)}
        />
      </div>

      {/* Audit Info */}
      <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Informações de auditoria:</p>
            <ul className="mt-2 space-y-1">
              <li>
                Criado em:{" "}
                {new Date(citizen.createdAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </li>
              <li>
                Última atualização:{" "}
                {new Date(citizen.updatedAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
