"use client";

interface MagicLinkSentProps {
  email: string;
  onBackToLogin?: () => void;
}

export function MagicLinkSent({ email, onBackToLogin }: MagicLinkSentProps) {
  return (
    <div
      className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg border border-gray-200"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu Email</h2>

        <p className="text-gray-600 mb-1">Um link de acesso foi enviado para:</p>

        <p className="text-lg font-semibold text-gray-900 mb-4">{email}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-left mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Próximos passos:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Abra sua caixa de entrada</li>
            <li>Procure por um email do AuroraSocial</li>
            <li>Clique no botão &quot;Fazer Login&quot;</li>
            <li>Você será automaticamente autenticado</li>
          </ol>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>O link expira em 24 horas.</p>
          <p>Não recebeu o email? Verifique sua pasta de spam.</p>
        </div>

        {onBackToLogin && (
          <button
            onClick={onBackToLogin}
            className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-2 py-1"
            type="button"
          >
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}
