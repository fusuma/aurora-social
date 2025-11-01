/**
 * AttachmentList Component
 *
 * Story 2.3: Profile View Screen
 * Story 2.6: Gestão de Anexos (Upload e Visualização)
 *
 * Features:
 * - Display list of attached files
 * - Show: File Name, Upload Date, Uploader
 * - File type icons
 * - Download/preview links with secure URLs (NFR4)
 * - Upload modal integration (FR2)
 * - Delete attachment with confirmation (FR2, NFR5)
 * - Tenant isolation (NFR2, NFR5)
 * - WCAG AA accessibility
 */

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import type { Anexo } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
import { FileUploadModal } from "./FileUploadModal";

interface AttachmentListProps {
  anexos: Anexo[];
  citizenId: string;
  entityType: "familia" | "individuo";
  onRefresh: () => void;
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

export function AttachmentList({ anexos, citizenId, entityType, onRefresh }: AttachmentListProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      setDeleteConfirmId(null);
      onRefresh();
    },
  });

  const handleDelete = async (anexoId: string) => {
    await deleteMutation.mutateAsync({ id: anexoId });
  };

  return (
    <>
      <section
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        aria-labelledby="attachments-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="attachments-title" className="text-lg font-semibold text-gray-900">
            Anexos
          </h2>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Adicionar novo anexo"
          >
            + Adicionar
          </button>
        </div>

        {anexos.length > 0 ? (
          <div className="space-y-3">
            <ul className="space-y-2" role="list">
              {anexos.map((anexo) => (
                <li key={anexo.id}>
                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                    {/* File Icon */}
                    <div className="flex-shrink-0">{getFileIcon(anexo.mimeType)}</div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={anexo.blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label={`Abrir arquivo ${anexo.fileName}`}
                      >
                        {anexo.fileName}
                      </a>
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

                    {/* Delete Button */}
                    <div className="flex-shrink-0">
                      {deleteConfirmId === anexo.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(anexo.id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs font-medium text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                            aria-label="Confirmar exclusão"
                          >
                            {deleteMutation.isPending ? "Excluindo..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleteMutation.isPending}
                            className="text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
                            aria-label="Cancelar exclusão"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(anexo.id)}
                          className="text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                          aria-label={`Excluir arquivo ${anexo.fileName}`}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
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
              <button
                onClick={() => setIsUploadModalOpen(true)}
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
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          onRefresh();
        }}
        entityId={citizenId}
        entityType={entityType}
      />
    </>
  );
}
