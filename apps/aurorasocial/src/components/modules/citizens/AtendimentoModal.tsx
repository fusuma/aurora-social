/**
 * AtendimentoModal Component
 *
 * Story 2.5: Registro de Atendimento (Modal)
 *
 * Features:
 * - Modal form for registering new atendimento (visit)
 * - React Hook Form + Zod validation
 * - TipoDemanda select dropdown
 * - Auto-populated date/time and user
 * - Tenant-isolated (NFR2)
 * - WCAG AA accessibility
 * - Success callback with cache invalidation
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { TipoDemanda } from "@prisma/client";

/**
 * Validation schema for Atendimento form
 */
const atendimentoSchema = z.object({
  tipoDemanda: z.nativeEnum(TipoDemanda),
  encaminhamento: z
    .string()
    .min(10, "Encaminhamento deve ter ao menos 10 caracteres")
    .max(5000, "Encaminhamento deve ter no máximo 5000 caracteres"),
  parecerSocial: z
    .string()
    .min(10, "Parecer social deve ter ao menos 10 caracteres")
    .max(5000, "Parecer social deve ter no máximo 5000 caracteres"),
});

type AtendimentoFormData = z.infer<typeof atendimentoSchema>;

interface AtendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenId: string;
  citizenName: string;
}

/**
 * Translate TipoDemanda enum to Portuguese
 */
function translateTipoDemanda(tipo: TipoDemanda): string {
  const translations: Record<TipoDemanda, string> = {
    BENEFICIO_EVENTUAL: "Benefício Eventual",
    CADASTRO_UNICO: "Cadastro Único",
    BPC: "BPC",
    BOLSA_FAMILIA: "Bolsa Família",
    ORIENTACAO_SOCIAL: "Orientação Social",
    ENCAMINHAMENTO_SAUDE: "Encaminhamento Saúde",
    ENCAMINHAMENTO_EDUCACAO: "Encaminhamento Educação",
    VIOLACAO_DIREITOS: "Violação de Direitos",
    OUTRO: "Outro",
  };
  return translations[tipo];
}

export function AtendimentoModal({
  isOpen,
  onClose,
  citizenId,
  citizenName,
}: AtendimentoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AtendimentoFormData>({
    resolver: zodResolver(atendimentoSchema),
  });

  // tRPC mutation
  const createAtendimento = trpc.citizens.createAtendimento.useMutation({
    onSuccess: () => {
      // Invalidate citizen profile query to refresh atendimentos list
      utils.citizens.getProfile.invalidate({ id: citizenId });
      reset();
      setIsSubmitting(false);
      onClose();
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Erro ao registrar atendimento: ${error.message}`);
    },
  });

  // Form submission handler
  const onSubmit = (data: AtendimentoFormData) => {
    setIsSubmitting(true);
    createAtendimento.mutate({
      individuoId: citizenId,
      ...data,
    });
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle Escape key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && !isSubmitting) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                Registrar Atendimento
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Cidadão: <span className="font-medium">{citizenName}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tipo de Demanda (Required) */}
          <div>
            <label htmlFor="tipoDemanda" className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Demanda{" "}
              <span className="text-red-600" aria-label="obrigatório">
                *
              </span>
            </label>
            <select
              id="tipoDemanda"
              {...register("tipoDemanda")}
              disabled={isSubmitting}
              className={`block w-full rounded-md border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                errors.tipoDemanda ? "border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              aria-required="true"
              aria-invalid={!!errors.tipoDemanda}
              aria-describedby={errors.tipoDemanda ? "tipoDemanda-error" : undefined}
            >
              <option value="">Selecione um tipo de demanda</option>
              {Object.values(TipoDemanda).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {translateTipoDemanda(tipo)}
                </option>
              ))}
            </select>
            {errors.tipoDemanda && (
              <p id="tipoDemanda-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.tipoDemanda.message}
              </p>
            )}
          </div>

          {/* Encaminhamento (Required) */}
          <div>
            <label
              htmlFor="encaminhamento"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Encaminhamento{" "}
              <span className="text-red-600" aria-label="obrigatório">
                *
              </span>
            </label>
            <textarea
              id="encaminhamento"
              {...register("encaminhamento")}
              disabled={isSubmitting}
              rows={4}
              placeholder="Descreva os encaminhamentos realizados (ex: saúde, educação, assistência)"
              className={`block w-full rounded-md border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors resize-y ${
                errors.encaminhamento ? "border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              aria-required="true"
              aria-invalid={!!errors.encaminhamento}
              aria-describedby={errors.encaminhamento ? "encaminhamento-error" : undefined}
            />
            {errors.encaminhamento && (
              <p id="encaminhamento-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.encaminhamento.message}
              </p>
            )}
          </div>

          {/* Parecer Social (Required) */}
          <div>
            <label htmlFor="parecerSocial" className="block text-sm font-medium text-gray-900 mb-2">
              Parecer Social{" "}
              <span className="text-red-600" aria-label="obrigatório">
                *
              </span>
            </label>
            <textarea
              id="parecerSocial"
              {...register("parecerSocial")}
              disabled={isSubmitting}
              rows={6}
              placeholder="Descreva sua avaliação social do caso, diagnóstico, e recomendações"
              className={`block w-full rounded-md border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors resize-y ${
                errors.parecerSocial ? "border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              aria-required="true"
              aria-invalid={!!errors.parecerSocial}
              aria-describedby={errors.parecerSocial ? "parecerSocial-error" : undefined}
            />
            {errors.parecerSocial && (
              <p id="parecerSocial-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.parecerSocial.message}
              </p>
            )}
          </div>

          {/* Info Note */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
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
              <div className="text-sm text-blue-800">
                <p className="font-medium">Informação automática</p>
                <p className="mt-1">
                  A data/hora atual e seu usuário serão registrados automaticamente neste
                  atendimento.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Salvar Atendimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
