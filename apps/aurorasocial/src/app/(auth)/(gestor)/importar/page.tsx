/**
 * CSV Import Page (GESTOR-only)
 *
 * Story 2.7: Implementação da Importação de Dados
 *
 * Allows GESTOR to bulk import citizen profiles via CSV:
 * - Download CSV template
 * - Upload CSV file
 * - Real-time validation feedback
 * - Progress indicator for large imports
 * - Detailed error report for failed imports
 * - Success summary
 *
 * Security:
 * - GESTOR-only access (enforced by route group)
 * - All imports auto-assigned to gestor's tenantId
 * - CPF uniqueness validation per tenant
 */

"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";

interface ImportError {
  line: number;
  cpf?: string;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
  message: string;
}

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplateMutation = trpc.import.downloadTemplate.useQuery(undefined, {
    enabled: false,
  });

  const uploadCSVMutation = trpc.import.uploadCSV.useMutation();

  const handleDownloadTemplate = () => {
    const template = downloadTemplateMutation.data;
    if (!template) {
      downloadTemplateMutation.refetch().then((result) => {
        if (result.data) {
          downloadCSVFile(result.data.content, result.data.filename);
        }
      });
      return;
    }

    downloadCSVFile(template.content, template.filename);
  };

  const downloadCSVFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith(".csv")) {
        alert("Por favor, selecione um arquivo CSV válido");
        return;
      }

      setFile(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Read file content
      const csvContent = await file.text();

      // Upload and process
      const uploadResult = await uploadCSVMutation.mutateAsync({
        csvContent,
        batchSize: 100, // Process 100 rows per transaction
      });

      setResult(uploadResult);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: [],
        message:
          error instanceof Error ? error.message : "Erro ao processar arquivo. Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Importação de Dados</h1>
        <p className="mt-2 text-gray-600">
          Importe cadastros de cidadãos em lote usando um arquivo CSV
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Como importar:</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Baixe o modelo CSV clicando no botão abaixo</li>
          <li>Preencha o arquivo com os dados dos cidadãos</li>
          <li>
            Certifique-se de que os CPFs estão corretos e não duplicados (11 dígitos sem formatação)
          </li>
          <li>Faça upload do arquivo preenchido</li>
          <li>Aguarde o processamento e verifique o resultado</li>
        </ol>
      </div>

      {/* Download Template Button */}
      <div className="mb-8">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
          aria-label="Baixar modelo CSV"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Baixar Modelo CSV
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-300 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload do Arquivo</h2>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o arquivo CSV:
            </label>
            <input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Selecionar arquivo CSV"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Processar importação"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Importar Dados
                </>
              )}
            </button>

            {file && !isProcessing && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                aria-label="Cancelar e limpar seleção"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div
          className={`border rounded-lg p-6 ${
            result.success ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg
                className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}

            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  result.success ? "text-green-900" : "text-red-900"
                }`}
              >
                {result.success ? "Importação Concluída!" : "Erro na Importação"}
              </h3>
              <p className={`text-sm mb-4 ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.message}
              </p>

              {/* Error Details */}
              {!result.success && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Detalhes dos Erros:</h4>
                  <div className="bg-white border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-200">
                          <th className="text-left py-2 px-3 font-semibold text-red-900">Linha</th>
                          <th className="text-left py-2 px-3 font-semibold text-red-900">CPF</th>
                          <th className="text-left py-2 px-3 font-semibold text-red-900">
                            Erro(s)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((error, index) => (
                          <tr key={index} className="border-b border-red-100">
                            <td className="py-2 px-3 text-red-800 font-mono">{error.line}</td>
                            <td className="py-2 px-3 text-red-800 font-mono">{error.cpf || "-"}</td>
                            <td className="py-2 px-3 text-red-700">
                              <ul className="list-disc list-inside">
                                {error.errors.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success Summary */}
              {result.success && (
                <div className="mt-4 bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="font-semibold">{result.imported} cidadão(s) importado(s)</span>
                  </div>
                  <p className="mt-2 text-sm text-green-700">
                    Todos os cadastros foram importados com sucesso e estão disponíveis para
                    consulta.
                  </p>
                </div>
              )}

              {/* Action buttons after result */}
              <div className="mt-4 flex gap-3">
                {result.success && (
                  <a
                    href="/pesquisar"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
                  >
                    Ver Cadastros
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                >
                  Importar Outro Arquivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">Segurança:</strong> Todos os cadastros importados são
          automaticamente associados à sua municipalidade. CPFs duplicados serão rejeitados
          automaticamente.
        </p>
      </div>
    </div>
  );
}
