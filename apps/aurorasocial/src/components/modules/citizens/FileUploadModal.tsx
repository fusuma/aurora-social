/**
 * FileUploadModal Component
 *
 * Story 2.6: Gestão de Anexos (Upload e Visualização)
 *
 * Features:
 * - Drag-and-drop file upload zone
 * - File type validation (.jpg, .png, .pdf) (NFR9)
 * - File size validation (10MB max) (NFR9)
 * - User-friendly error messages (FR2)
 * - Upload progress indicator
 * - WCAG AA accessibility
 */

"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { trpc } from "@/lib/trpc/client";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityId: string;
  entityType: "familia" | "individuo";
}

// File validation constants (NFR9)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FileUploadModal({
  isOpen,
  onClose,
  onSuccess,
  entityId,
  entityType,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.attachments.upload.useMutation({
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  /**
   * Validate file (FR2, NFR9)
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Tipo de arquivo não permitido. Apenas ${ALLOWED_EXTENSIONS.join(", ")} são aceitos.`;
    }

    // Check file extension (additional layer of security)
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return `Extensão de arquivo não permitida. Apenas ${ALLOWED_EXTENSIONS.join(", ")} são aceitos.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Tamanho máximo: ${formatFileSize(MAX_FILE_SIZE)} (arquivo: ${formatFileSize(file.size)})`;
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (file: File) => {
    setError("");

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setError("");

      // Convert file to base64
      const base64Data = await fileToBase64(selectedFile);

      // Upload via tRPC
      await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        fileData: base64Data,
        familiaId: entityType === "familia" ? entityId : undefined,
        individuoId: entityType === "individuo" ? entityId : undefined,
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Upload error:", error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setSelectedFile(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="upload-modal-title" className="text-xl font-semibold text-gray-900">
            Adicionar Anexo
          </h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

        {/* File Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload-input"
          />

          {selectedFile ? (
            <div className="space-y-3">
              {/* File Icon */}
              <div className="flex justify-center">
                {selectedFile.type === "application/pdf" ? (
                  <svg
                    className="h-12 w-12 text-red-500"
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
                ) : (
                  <svg
                    className="h-12 w-12 text-blue-500"
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
                )}
              </div>

              {/* File Info */}
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
              </div>

              {/* Change File Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                Trocar arquivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Upload Icon */}
              <div className="flex justify-center">
                <svg
                  className="h-12 w-12 text-gray-400"
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
              </div>

              {/* Instructions */}
              <div>
                <label htmlFor="file-upload-input">
                  <span className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none">
                    Clique para selecionar
                  </span>
                </label>
                <p className="text-sm text-gray-600">ou arraste o arquivo aqui</p>
              </div>

              {/* Allowed Types */}
              <p className="text-xs text-gray-500">
                JPG, PNG ou PDF (máx. {formatFileSize(MAX_FILE_SIZE)})
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 p-3"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
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
              <p className="ml-2 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploadMutation.isPending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
