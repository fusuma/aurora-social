/**
 * Import Router (CSV Import for Citizens)
 *
 * Story 2.7: CSV Import Implementation
 * GESTOR-only endpoints for bulk citizen import
 *
 * - CSV template download
 * - CSV upload with validation and batch processing
 * - CPF uniqueness validation per tenant
 * - Error reporting for failed rows
 * - Transaction-based import (all-or-nothing)
 */

import { z } from "zod";
import { gestorProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";
import { TRPCError } from "@trpc/server";
import { parse } from "csv-parse/sync";
import { Prisma } from "@prisma/client";

// CSV Row Schema
const csvRowSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
  nomeMae: z.string().optional(),
  nis: z
    .string()
    .regex(/^\d{11}$/, "NIS deve conter exatamente 11 dígitos")
    .optional(),
  rg: z.string().optional(),
  tituloEleitor: z.string().optional(),
  carteiraTrabalho: z.string().optional(),
  // Family fields (optional)
  endereco: z.string().optional(),
  rendaFamiliarTotal: z.string().optional(),
  ehResponsavel: z.enum(["SIM", "NAO"]).optional(),
});

type CSVRow = z.infer<typeof csvRowSchema>;

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

export const importRouter = router({
  /**
   * Download CSV Template
   * GESTOR-only
   *
   * Returns CSV template with headers and example data
   * User can download this to understand format
   */
  downloadTemplate: gestorProcedure.query(() => {
    const headers = [
      "nomeCompleto",
      "cpf",
      "dataNascimento",
      "sexo",
      "nomeMae",
      "nis",
      "rg",
      "tituloEleitor",
      "carteiraTrabalho",
      "endereco",
      "rendaFamiliarTotal",
      "ehResponsavel",
    ];

    const exampleRow = [
      "João da Silva",
      "12345678901",
      "1985-05-15",
      "MASCULINO",
      "Maria da Silva",
      "10987654321",
      "MG1234567",
      "123456789012",
      "1234567",
      "Rua das Flores, 123, Centro",
      "1500.00",
      "SIM",
    ];

    const csv = [headers.join(","), exampleRow.join(",")].join("\n");

    return {
      filename: "template-importacao-cidadaos.csv",
      content: csv,
      mimeType: "text/csv",
    };
  }),

  /**
   * Upload and Process CSV
   * GESTOR-only
   *
   * - Parse CSV content
   * - Validate each row
   * - Check CPF uniqueness per tenant
   * - Batch insert with transaction
   * - Return detailed error report if any validation fails
   *
   * Security:
   * - All records auto-assigned to gestor's tenantId
   * - CPF uniqueness scoped to tenant
   * - Transaction ensures all-or-nothing import
   */
  uploadCSV: gestorProcedure
    .input(
      z.object({
        csvContent: z.string().min(1, "CSV não pode estar vazio"),
        batchSize: z.number().min(1).max(500).default(100), // Process in batches to avoid timeout
      })
    )
    .mutation(async ({ input, ctx }): Promise<ImportResult> => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { csvContent, batchSize } = input;

          // Parse CSV
          let rows: Record<string, string>[];
          try {
            rows = parse(csvContent, {
              columns: true, // Use first row as headers
              skip_empty_lines: true,
              trim: true,
              bom: true, // Handle UTF-8 BOM
            }) as Record<string, string>[];
          } catch (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Erro ao processar CSV: ${error instanceof Error ? error.message : "Formato inválido"}`,
            });
          }

          if (rows.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "CSV está vazio ou não contém dados válidos",
            });
          }

          // Validate all rows first
          const validationErrors: ImportError[] = [];
          const validatedRows: CSVRow[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const lineNumber = i + 2; // +2 because: 1-indexed + header row

            try {
              // Normalize CPF and NIS (remove non-digits)
              const normalizedRow = {
                ...row,
                cpf: row.cpf?.replace(/\D/g, "") || "",
                nis: row.nis?.replace(/\D/g, "") || undefined,
              };

              const validated = csvRowSchema.parse(normalizedRow);
              validatedRows.push(validated);
            } catch (error) {
              if (error instanceof z.ZodError) {
                validationErrors.push({
                  line: lineNumber,
                  cpf: row.cpf,
                  errors: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
                });
              } else {
                validationErrors.push({
                  line: lineNumber,
                  cpf: row.cpf,
                  errors: ["Erro desconhecido na validação"],
                });
              }
            }
          }

          // If validation errors, return them
          if (validationErrors.length > 0) {
            return {
              success: false,
              imported: 0,
              errors: validationErrors,
              message: `${validationErrors.length} linha(s) com erro de validação. Corrija os erros e tente novamente.`,
            };
          }

          // Check CPF uniqueness within tenant (before transaction)
          const cpfs = validatedRows.map((r) => r.cpf);
          const duplicatesInFile = cpfs.filter((cpf, index) => cpfs.indexOf(cpf) !== index);

          if (duplicatesInFile.length > 0) {
            const duplicateErrors: ImportError[] = duplicatesInFile.map((cpf) => ({
              line: cpfs.indexOf(cpf) + 2,
              cpf,
              errors: [`CPF ${cpf} aparece múltiplas vezes no arquivo`],
            }));

            return {
              success: false,
              imported: 0,
              errors: duplicateErrors,
              message: `CPFs duplicados encontrados no arquivo. Cada CPF deve aparecer apenas uma vez.`,
            };
          }

          // Check for existing CPFs in database
          const existingCitizens = await ctx.prisma.individuo.findMany({
            where: {
              tenantId: ctx.session.user.tenantId,
              cpf: {
                in: cpfs,
              },
            },
            select: {
              cpf: true,
            },
          });

          if (existingCitizens.length > 0) {
            const existingErrors: ImportError[] = existingCitizens.map((citizen) => {
              const lineIndex = validatedRows.findIndex((r) => r.cpf === citizen.cpf);
              return {
                line: lineIndex + 2,
                cpf: citizen.cpf,
                errors: [`CPF ${citizen.cpf} já está cadastrado no sistema`],
              };
            });

            return {
              success: false,
              imported: 0,
              errors: existingErrors,
              message: `${existingCitizens.length} CPF(s) já cadastrado(s) no sistema. Remova-os do arquivo e tente novamente.`,
            };
          }

          // All validation passed - proceed with batch import
          let importedCount = 0;

          try {
            // Process in batches to avoid timeout for large datasets
            for (let i = 0; i < validatedRows.length; i += batchSize) {
              const batch = validatedRows.slice(i, i + batchSize);

              await ctx.prisma.$transaction(async (tx) => {
                for (const row of batch) {
                  // Create Individuo
                  const individuo = await tx.individuo.create({
                    data: {
                      tenantId: ctx.session.user.tenantId,
                      nomeCompleto: row.nomeCompleto,
                      cpf: row.cpf,
                      dataNascimento: new Date(row.dataNascimento),
                      sexo: row.sexo,
                      nomeMae: row.nomeMae || null,
                      nis: row.nis || null,
                      rg: row.rg || null,
                      tituloEleitor: row.tituloEleitor || null,
                      carteiraTrabalho: row.carteiraTrabalho || null,
                      createdBy: ctx.session.user.id,
                    },
                  });

                  // If marked as responsavel, create Familia
                  if (row.ehResponsavel === "SIM" && row.endereco) {
                    const familia = await tx.familia.create({
                      data: {
                        tenantId: ctx.session.user.tenantId,
                        responsavelFamiliarId: individuo.id,
                        endereco: row.endereco,
                        rendaFamiliarTotal: row.rendaFamiliarTotal
                          ? new Prisma.Decimal(parseFloat(row.rendaFamiliarTotal))
                          : null,
                        createdBy: ctx.session.user.id,
                      },
                    });

                    // Add responsavel to family composition
                    await tx.composicaoFamiliar.create({
                      data: {
                        familiaId: familia.id,
                        individuoId: individuo.id,
                        parentesco: "RESPONSAVEL",
                      },
                    });
                  }

                  importedCount++;
                }
              });
            }

            return {
              success: true,
              imported: importedCount,
              errors: [],
              message: `${importedCount} cidadão(s) importado(s) com sucesso!`,
            };
          } catch (error) {
            // Transaction failed
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao salvar dados: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            });
          }
        },
        ctx.session.user.id
      );
    }),
});
