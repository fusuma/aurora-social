/**
 * ProfileForm Component
 *
 * Story 2.4: Create/Edit Profile
 *
 * Multi-step form for creating/editing citizen profiles with CadÚnico fields.
 *
 * Features:
 * - Step 1: Personal data (nome, CPF, data nascimento, sexo)
 * - Step 2: CadÚnico additional data (NIS, RG, etc.)
 * - Step 3: Family data (if creating as responsável)
 * - Client-side validation
 * - CPF/NIS formatting
 * - WCAG AA accessibility
 */

"use client";

import { useState } from "react";
import { Sexo } from "@prisma/client";

interface ProfileFormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: Date;
  sexo: Sexo;
  nomeMae?: string;
  nis?: string;
  rg?: string;
  tituloEleitor?: string;
  carteiraTrabalho?: string;
  createAsResponsavel: boolean;
  endereco?: string;
  rendaFamiliarTotal?: number;
}

interface ProfileFormInitialData {
  nomeCompleto?: string;
  cpf?: string;
  dataNascimento?: Date;
  sexo?: Sexo;
  nomeMae?: string | null;
  nis?: string | null;
  rg?: string | null;
  tituloEleitor?: string | null;
  carteiraTrabalho?: string | null;
}

interface ProfileFormProps {
  mode: "create" | "edit";
  initialData?: ProfileFormInitialData;
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProfileForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = mode === "create" ? 3 : 2; // No family step in edit mode

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    nomeCompleto: initialData?.nomeCompleto || "",
    cpf: initialData?.cpf || "",
    dataNascimento: initialData?.dataNascimento || new Date(),
    sexo: initialData?.sexo || "MASCULINO",
    nomeMae: initialData?.nomeMae || "",
    nis: initialData?.nis || "",
    rg: initialData?.rg || "",
    tituloEleitor: initialData?.tituloEleitor || "",
    carteiraTrabalho: initialData?.carteiraTrabalho || "",
    createAsResponsavel: false,
    endereco: "",
    rendaFamiliarTotal: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format CPF: 123.456.789-01
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Format NIS: 123.45678.90-1
  const formatNIS = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 10)
      return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8, 10)}-${digits.slice(10)}`;
  };

  // Validate step 1 (personal data)
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto || formData.nomeCompleto.length < 3) {
      newErrors.nomeCompleto = "Nome deve ter ao menos 3 caracteres";
    }

    const cpfDigits = formData.cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 dígitos";
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2 (CadÚnico data)
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.nis) {
      const nisDigits = formData.nis.replace(/\D/g, "");
      if (nisDigits.length !== 11) {
        newErrors.nis = "NIS deve conter 11 dígitos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 3 (family data) - only in create mode
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.createAsResponsavel) {
      if (!formData.endereco || formData.endereco.length < 5) {
        newErrors.endereco = "Endereço deve ter ao menos 5 caracteres";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation based on mode
    let isValid = false;
    if (mode === "edit") {
      isValid = validateStep1() && validateStep2();
    } else {
      isValid = validateStep1() && validateStep2() && validateStep3();
    }

    if (isValid) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep >= step
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  }`}
                  aria-current={currentStep === step ? "step" : undefined}
                >
                  {step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step === 1 && "Dados Pessoais"}
                  {step === 2 && "CadÚnico"}
                  {step === 3 && "Família"}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`ml-4 flex-1 h-0.5 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Personal Data */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>

          {/* Nome Completo */}
          <div>
            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">
              Nome Completo <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              className={`mt-1 block w-full rounded-md border ${
                errors.nomeCompleto ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
              placeholder="João da Silva"
              required
              aria-invalid={!!errors.nomeCompleto}
              aria-describedby={errors.nomeCompleto ? "nomeCompleto-error" : undefined}
            />
            {errors.nomeCompleto && (
              <p id="nomeCompleto-error" className="mt-1 text-sm text-red-600">
                {errors.nomeCompleto}
              </p>
            )}
          </div>

          {/* CPF */}
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
              CPF <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="cpf"
              value={formatCPF(formData.cpf)}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className={`mt-1 block w-full rounded-md border ${
                errors.cpf ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
              placeholder="123.456.789-01"
              required
              aria-invalid={!!errors.cpf}
              aria-describedby={errors.cpf ? "cpf-error" : undefined}
            />
            {errors.cpf && (
              <p id="cpf-error" className="mt-1 text-sm text-red-600">
                {errors.cpf}
              </p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
              Data de Nascimento <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="dataNascimento"
              value={
                formData.dataNascimento instanceof Date
                  ? formData.dataNascimento.toISOString().split("T")[0]
                  : new Date(formData.dataNascimento).toISOString().split("T")[0]
              }
              onChange={(e) =>
                setFormData({ ...formData, dataNascimento: new Date(e.target.value) })
              }
              className={`mt-1 block w-full rounded-md border ${
                errors.dataNascimento ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
              required
              aria-invalid={!!errors.dataNascimento}
              aria-describedby={errors.dataNascimento ? "dataNascimento-error" : undefined}
            />
            {errors.dataNascimento && (
              <p id="dataNascimento-error" className="mt-1 text-sm text-red-600">
                {errors.dataNascimento}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
              Sexo <span className="text-red-600">*</span>
            </label>
            <select
              id="sexo"
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value as Sexo })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          {/* Nome da Mãe */}
          <div>
            <label htmlFor="nomeMae" className="block text-sm font-medium text-gray-700">
              Nome da Mãe
            </label>
            <input
              type="text"
              id="nomeMae"
              value={formData.nomeMae}
              onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="Maria da Silva"
            />
          </div>
        </div>
      )}

      {/* Step 2: CadÚnico Data */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Dados do CadÚnico</h2>
          <p className="text-sm text-gray-600">
            Campos opcionais, mas recomendados para o Cadastro Único federal.
          </p>

          {/* NIS */}
          <div>
            <label htmlFor="nis" className="block text-sm font-medium text-gray-700">
              NIS (Número de Identificação Social)
            </label>
            <input
              type="text"
              id="nis"
              value={formData.nis ? formatNIS(formData.nis) : ""}
              onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              className={`mt-1 block w-full rounded-md border ${
                errors.nis ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
              placeholder="123.45678.90-1"
              aria-invalid={!!errors.nis}
              aria-describedby={errors.nis ? "nis-error" : undefined}
            />
            {errors.nis && (
              <p id="nis-error" className="mt-1 text-sm text-red-600">
                {errors.nis}
              </p>
            )}
          </div>

          {/* RG */}
          <div>
            <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
              RG
            </label>
            <input
              type="text"
              id="rg"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="12.345.678-9"
            />
          </div>

          {/* Título de Eleitor */}
          <div>
            <label htmlFor="tituloEleitor" className="block text-sm font-medium text-gray-700">
              Título de Eleitor
            </label>
            <input
              type="text"
              id="tituloEleitor"
              value={formData.tituloEleitor}
              onChange={(e) => setFormData({ ...formData, tituloEleitor: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="1234 5678 9012"
            />
          </div>

          {/* Carteira de Trabalho */}
          <div>
            <label htmlFor="carteiraTrabalho" className="block text-sm font-medium text-gray-700">
              Carteira de Trabalho
            </label>
            <input
              type="text"
              id="carteiraTrabalho"
              value={formData.carteiraTrabalho}
              onChange={(e) => setFormData({ ...formData, carteiraTrabalho: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="1234567"
            />
          </div>
        </div>
      )}

      {/* Step 3: Family Data (create mode only) */}
      {currentStep === 3 && mode === "create" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Dados da Família</h2>

          {/* Create as Responsável */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="createAsResponsavel"
              checked={formData.createAsResponsavel}
              onChange={(e) => setFormData({ ...formData, createAsResponsavel: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="createAsResponsavel" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">Criar como Responsável Familiar</span>
              <p className="mt-1 text-gray-600">
                Marque esta opção se esta pessoa será o chefe da família. Você poderá adicionar
                outros membros depois.
              </p>
            </label>
          </div>

          {/* Show family fields if creating as responsável */}
          {formData.createAsResponsavel && (
            <>
              {/* Endereço */}
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                  Endereço da Família <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.endereco ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
                  placeholder="Rua das Flores, 123, Centro, Cidade - UF"
                  required={formData.createAsResponsavel}
                  aria-invalid={!!errors.endereco}
                  aria-describedby={errors.endereco ? "endereco-error" : undefined}
                />
                {errors.endereco && (
                  <p id="endereco-error" className="mt-1 text-sm text-red-600">
                    {errors.endereco}
                  </p>
                )}
              </div>

              {/* Renda Familiar Total */}
              <div>
                <label
                  htmlFor="rendaFamiliarTotal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Renda Familiar Total (R$)
                </label>
                <input
                  type="number"
                  id="rendaFamiliarTotal"
                  value={formData.rendaFamiliarTotal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rendaFamiliarTotal: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Soma de todos os rendimentos dos membros da família
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
              disabled={isSubmitting}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Anterior
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
            >
              Próximo
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {mode === "create" ? "Criando..." : "Salvando..."}
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
                  {mode === "create" ? "Criar Perfil" : "Salvar Alterações"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
