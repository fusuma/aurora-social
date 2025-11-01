/**
 * Create New Citizen Profile Page
 *
 * Story 2.4: Create/Edit Profile
 *
 * Features:
 * - Multi-step form for CadÚnico data + family composition
 * - CPF uniqueness validation
 * - Option to create as family responsible
 * - TÉCNICO and GESTOR access
 * - WCAG AA accessibility
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProfileForm } from "@/components/modules/citizens/ProfileForm";
import Link from "next/link";

export default function CreateProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.citizens.createCitizen.useMutation({
    onSuccess: (data) => {
      // Redirect to profile view
      router.push(`/perfil/${data.individuo.id}`);
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
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ""),
      nis: formData.nis ? formData.nis.replace(/\D/g, "") : undefined,
    };

    createMutation.mutate(normalizedData);
  };

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
            <li className="font-medium text-gray-900" aria-current="page">
              Criar Novo Perfil
            </li>
          </ol>
        </nav>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Perfil de Cidadão</h1>
          <p className="mt-2 text-gray-600">
            Preencha os dados do cidadão conforme o cadastro único (CadÚnico). Todos os campos
            marcados com * são obrigatórios.
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
              <h3 className="text-sm font-semibold text-red-900">Erro ao criar perfil</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <ProfileForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.back()}
        />
      </div>

      {/* Help Text */}
      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
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
          <div className="text-sm text-blue-900">
            <p className="font-semibold">Dicas de preenchimento:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>O CPF será validado e deve ser único no sistema</li>
              <li>
                Marque &quot;Criar como Responsável Familiar&quot; se esta pessoa será o chefe da
                família
              </li>
              <li>Você poderá adicionar membros da família após criar o perfil</li>
              <li>
                Campos como NIS, RG, Título de Eleitor são opcionais mas recomendados para o
                CadÚnico
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
