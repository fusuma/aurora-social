/**
 * AttachmentList Component
 *
 * Story 2.3: Profile View Screen
 *
 * Features:
 * - Display list of attached files
 * - Show: File Name, Upload Date
 * - File type icons
 * - Download/preview links
 * - WCAG AA accessibility
 */

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import type { Anexo } from "@prisma/client";

interface AttachmentListProps {
  anexos: Anexo[];
  citizenId: string;
}

/**
 * Get file icon based on MIME type
 */
function getFileIcon(mimeType: string): JSX.Element {
  // PDF files
  if (mimeType === "application/pdf") {
    return (
      <svg
        className="h-8 w-8 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }

  // Image files
  if (mimeType.startsWith("image/")) {
    return (
      <svg
        className="h-8 w-8 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );
  }

  // Word documents
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <svg
        className="h-8 w-8 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }

  // Default file icon
  return (
    <svg
      className="h-8 w-8 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

export function AttachmentList({ anexos, citizenId }: AttachmentListProps) {
  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-labelledby="attachments-title"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="attachments-title" className="text-lg font-semibold text-gray-900">
          Anexos
        </h2>
        <Link
          href={`/perfil/${citizenId}/adicionar-anexo`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Adicionar novo anexo"
        >
          + Adicionar
        </Link>
      </div>

      {anexos.length > 0 ? (
        <div className="space-y-3">
          <ul className="space-y-2" role="list">
            {anexos.map((anexo) => (
              <li key={anexo.id}>
                <a
                  href={anexo.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`Abrir arquivo ${anexo.fileName}`}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">{getFileIcon(anexo.mimeType)}</div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
                      title={anexo.fileName}
                    >
                      {anexo.fileName}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                      <span>{getFileExtension(anexo.fileName)}</span>
                      <span aria-hidden="true">•</span>
                      <span>{formatFileSize(anexo.fileSize)}</span>
                      <span aria-hidden="true">•</span>
                      <time dateTime={anexo.uploadedAt.toISOString()}>
                        {format(new Date(anexo.uploadedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </time>
                    </div>
                  </div>

                  {/* Download Icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {/* Total count */}
          <p className="text-sm text-gray-600 text-center pt-2 border-t border-gray-200">
            {anexos.length} arquivo{anexos.length !== 1 ? "s" : ""} anexado
            {anexos.length !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-gray-900">Nenhum anexo</h3>
          <p className="mt-1 text-sm text-gray-600">
            Este perfil ainda não possui arquivos anexados.
          </p>
          <div className="mt-4">
            <Link
              href={`/perfil/${citizenId}/adicionar-anexo`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Adicionar Primeiro Anexo
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
