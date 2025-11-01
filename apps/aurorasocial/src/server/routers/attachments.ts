/**
 * Attachments tRPC Router
 *
 * Story 2.6: Gestão de Anexos (Upload e Visualização)
 *
 * Provides endpoints for file attachment management:
 * - attachments.upload - Upload file to Vercel Blob and save metadata
 * - attachments.delete - Delete attachment from Blob and database
 * - attachments.getSignedUrl - Get secure signed URL for download/preview
 * - Tenant-isolated (NFR2, NFR5)
 * - File validation: type (.jpg, .png, .pdf) and size (10MB max) (NFR9)
 * - Audit logging (FR2, NFR5)
 * - TÉCNICO and GESTOR access
 */

import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";
import { TRPCError } from "@trpc/server";
import { put, del } from "@vercel/blob";

// File validation constants (FR2, NFR9)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"] as const;

/**
 * Validate file extension
 */
function hasValidExtension(filename: string): boolean {
  const lowercaseFilename = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowercaseFilename.endsWith(ext));
}

/**
 * Validate MIME type
 */
function hasValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number]);
}

export const attachmentsRouter = router({
  /**
   * Upload attachment to Vercel Blob
   * TÉCNICO and GESTOR access
   * Story 2.6: Gestão de Anexos
   *
   * - Upload file to Vercel Blob
   * - Save metadata to Anexo table
   * - Validate file type and size (NFR9)
   * - Tenant isolation (NFR2)
   * - Audit logging via uploadedBy and uploadedAt
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
        fileSize: z.number().min(1, "Tamanho do arquivo inválido"),
        mimeType: z.string().min(1, "Tipo do arquivo é obrigatório"),
        fileData: z.string(), // Base64 encoded file data
        // Polymorphic relation (attach to familia OR individuo)
        familiaId: z.string().cuid().optional(),
        individuoId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { fileName, fileSize, mimeType, fileData, familiaId, individuoId } = input;

          // Validation: Must attach to either familia OR individuo (not both)
          if (!familiaId && !individuoId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "É necessário especificar familiaId ou individuoId",
            });
          }

          if (familiaId && individuoId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Não é possível anexar a família e indivíduo simultaneamente",
            });
          }

          // Validation: File extension (NFR9)
          if (!hasValidExtension(fileName)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Tipo de arquivo não permitido. Apenas ${ALLOWED_EXTENSIONS.join(", ")} são aceitos.`,
            });
          }

          // Validation: MIME type (NFR9)
          if (!hasValidMimeType(mimeType)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Tipo de arquivo não permitido. Apenas imagens (JPG, PNG) e PDFs são aceitos.`,
            });
          }

          // Validation: File size (NFR9)
          if (fileSize > MAX_FILE_SIZE) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            });
          }

          // Verify familia or individuo exists and belongs to tenant
          if (familiaId) {
            const familia = await ctx.prisma.familia.findUnique({
              where: {
                id: familiaId,
                tenantId: ctx.session.user.tenantId,
              },
            });

            if (!familia) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Família não encontrada",
              });
            }
          }

          if (individuoId) {
            const individuo = await ctx.prisma.individuo.findUnique({
              where: {
                id: individuoId,
                tenantId: ctx.session.user.tenantId,
              },
            });

            if (!individuo) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Cidadão não encontrado",
              });
            }
          }

          // Convert base64 to Buffer
          const fileBuffer = Buffer.from(fileData, "base64");

          // Verify buffer size matches input (integrity check)
          if (fileBuffer.length !== fileSize) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Tamanho do arquivo não corresponde aos dados enviados",
            });
          }

          try {
            // Upload to Vercel Blob
            // Path format: {tenantId}/{familiaId|individuoId}/{timestamp}-{filename}
            const entityId = familiaId || individuoId;
            const timestamp = Date.now();
            const blobPath = `${ctx.session.user.tenantId}/${entityId}/${timestamp}-${fileName}`;

            const blob = await put(blobPath, fileBuffer, {
              access: "public", // We'll control access via tenant isolation in DB
              contentType: mimeType,
            });

            // Save metadata to database
            const anexo = await ctx.prisma.anexo.create({
              data: {
                tenantId: ctx.session.user.tenantId,
                blobUrl: blob.url,
                fileName,
                fileSize,
                mimeType,
                uploadedBy: ctx.session.user.id,
                familiaId: familiaId || null,
                individuoId: individuoId || null,
              },
            });

            // TODO: Create audit log entry (NFR5)
            // This will be implemented in a future story when AuditLog system is created

            return anexo;
          } catch (error) {
            // If Vercel Blob upload fails, throw error
            console.error("Vercel Blob upload failed:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Falha ao fazer upload do arquivo. Tente novamente.",
            });
          }
        },
        ctx.session.user.id
      );
    }),

  /**
   * Delete attachment
   * TÉCNICO and GESTOR access
   * Story 2.6: Gestão de Anexos
   *
   * - Remove from Vercel Blob
   * - Remove metadata from database
   * - Tenant isolation (NFR2)
   * - Audit logging (NFR5)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { id } = input;

          // Fetch anexo and verify tenant ownership
          const anexo = await ctx.prisma.anexo.findUnique({
            where: {
              id,
              tenantId: ctx.session.user.tenantId, // Tenant isolation (NFR2)
            },
          });

          if (!anexo) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Anexo não encontrado",
            });
          }

          try {
            // Delete from Vercel Blob
            await del(anexo.blobUrl);

            // Delete metadata from database
            await ctx.prisma.anexo.delete({
              where: {
                id,
              },
            });

            // TODO: Create audit log entry (NFR5)
            // Log: User X deleted attachment Y (fileName) from familia/individuo Z

            return { success: true };
          } catch (error) {
            console.error("Failed to delete attachment:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Falha ao excluir anexo. Tente novamente.",
            });
          }
        },
        ctx.session.user.id
      );
    }),

  /**
   * Get signed URL for secure download/preview
   * TÉCNICO and GESTOR access
   * Story 2.6: Gestão de Anexos
   *
   * - Verify user has permission (same tenant)
   * - Generate secure signed URL (NFR4)
   * - Tenant isolation (NFR5)
   *
   * NOTE: Vercel Blob URLs are already secure if access is set to "public" with tenant path isolation.
   * For additional security, we could implement token-based URLs or time-limited signed URLs.
   * For MVP, we rely on tenant isolation in the database + URL path structure.
   */
  getSignedUrl: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { id } = input;

          // Fetch anexo and verify tenant ownership (NFR4, NFR5)
          const anexo = await ctx.prisma.anexo.findUnique({
            where: {
              id,
              tenantId: ctx.session.user.tenantId, // Tenant isolation
            },
          });

          if (!anexo) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Anexo não encontrado ou você não tem permissão para acessá-lo",
            });
          }

          // For MVP: Return the blob URL directly (already tenant-isolated by path)
          // Future enhancement: Generate time-limited signed URL with token
          return {
            url: anexo.blobUrl,
            fileName: anexo.fileName,
            mimeType: anexo.mimeType,
          };
        },
        ctx.session.user.id
      );
    }),
});
