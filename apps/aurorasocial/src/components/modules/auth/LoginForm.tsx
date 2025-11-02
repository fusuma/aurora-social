"use client";

import { FormEvent, useState } from "react";
import { EmailInput } from "./EmailInput";
import { MagicLinkSent } from "./MagicLinkSent";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  callbackUrl?: string;
  error?: string | null;
}

export function LoginForm({ callbackUrl = "/", error: initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState(initialError || "");

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

    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email: email.trim().toLowerCase(),
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        // Map Auth.js errors to user-friendly messages
        const errorMessages: Record<string, string> = {
          Configuration: "Erro de configuração do sistema. Contate o suporte.",
          AccessDenied: "Acesso negado. Usuário inativo ou não autorizado.",
          Verification: "Link de verificação inválido ou expirado.",
          Default: "Não foi possível enviar o email. Tente novamente.",
        };

        setGeneralError(errorMessages[result.error] || errorMessages.Default);
        setIsLoading(false);
      } else {
        // Success - email sent
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (err) {
      setGeneralError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsSuccess(false);
    setEmail("");
    setEmailError("");
    setGeneralError("");
  };

  if (isSuccess) {
    return <MagicLinkSent email={email} onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg border border-gray-200">
      <div>
        <h1 className="text-center text-3xl font-bold text-gray-900">Acesse o AuroraSocial</h1>
        <p className="mt-3 text-center text-sm text-gray-600">
          Digite seu email para receber um link de acesso seguro
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        {generalError && (
          <div
            className="bg-red-50 border border-red-200 rounded-md p-4"
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

        <div>
          <EmailInput
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={(e) => validateEmail(e.target.value)}
            error={emailError}
            disabled={isLoading}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full flex justify-center items-center
              rounded-md bg-blue-600 px-4 py-3
              text-base font-semibold text-white
              hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
              disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors
            "
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              "Enviar Link de Acesso"
            )}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Você receberá um email com um link seguro para acessar o sistema.</p>
          <p className="mt-2">O link expira em 24 horas e só pode ser usado uma vez.</p>
        </div>
      </form>
    </div>
  );
}
