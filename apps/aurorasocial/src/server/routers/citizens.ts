/**
 * Citizens tRPC Router
 *
 * Provides endpoints for citizen/family search and profile management:
 * - citizens.search - Search citizens by name, CPF, or NIS (Story 2.2)
 * - citizens.getProfile - Get citizen profile with history (Story 2.3)
 * - Tenant-isolated queries (NFR2, NFR5)
 * - TÉCNICO and GESTOR access
 */

import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";
import { TRPCError } from "@trpc/server";

export const citizensRouter = router({
  /**
   * Search citizens by name, CPF, or NIS
   * TÉCNICO and GESTOR access
   * Story 2.2: Citizen Search Screen
   *
   * - Fuzzy search (case-insensitive, accent-insensitive)
   * - Searches: nomeCompleto, cpf, nis
   * - Tenant-isolated results only
   * - Paginated results (20 per page)
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Digite ao menos 1 caractere para pesquisar"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { query, page, limit } = input;

          // Calculate pagination
          const skip = (page - 1) * limit;

          // Search by normalized name, CPF, or NIS
          // CPF and NIS are stored normalized (digits only)
          const digitsOnly = query.replace(/\D/g, "");

          // Build search conditions dynamically
          const searchConditions: Array<{
            nomeCompleto?: { contains: string; mode: "insensitive" };
            cpf?: { contains: string };
            nis?: { contains: string };
          }> = [
            // Search by name (case-insensitive, accent-insensitive via database collation)
            {
              nomeCompleto: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ];

          // Add CPF search if input has digits
          if (digitsOnly.length > 0) {
            searchConditions.push({
              cpf: {
                contains: digitsOnly,
              },
            });

            // Add NIS search if input has digits
            searchConditions.push({
              nis: {
                contains: digitsOnly,
              },
            });
          }

          // Execute search with tenant isolation
          const [citizens, total] = await Promise.all([
            ctx.prisma.individuo.findMany({
              where: {
                tenantId: ctx.session.user.tenantId,
                OR: searchConditions,
              },
              select: {
                id: true,
                nomeCompleto: true,
                cpf: true,
                dataNascimento: true,
                nis: true,
              },
              orderBy: {
                nomeCompleto: "asc",
              },
              skip,
              take: limit,
            }),
            ctx.prisma.individuo.count({
              where: {
                tenantId: ctx.session.user.tenantId,
                OR: searchConditions,
              },
            }),
          ]);

          return {
            citizens,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          };
        },
        ctx.session.user.id
      );
    }),

  /**
   * Get citizen profile with complete history
   * TÉCNICO and GESTOR access
   * Story 2.3: Profile View Screen
   *
   * - Complete citizen data (CadÚnico fields)
   * - Family composition
   * - Service history (atendimentos)
   * - Attachments
   * - Tenant-isolated
   */
  getProfile: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          // Fetch citizen with related data
          const citizen = await ctx.prisma.individuo.findUnique({
            where: {
              id: input.id,
              tenantId: ctx.session.user.tenantId, // Tenant isolation
            },
            include: {
              // Family composition
              familias: {
                include: {
                  familia: {
                    include: {
                      responsavel: {
                        select: {
                          id: true,
                          nomeCompleto: true,
                          cpf: true,
                        },
                      },
                      membros: {
                        include: {
                          individuo: {
                            select: {
                              id: true,
                              nomeCompleto: true,
                              cpf: true,
                              dataNascimento: true,
                              sexo: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              // Service history (recent 10)
              atendimentos: {
                orderBy: {
                  data: "desc",
                },
                take: 10,
                include: {
                  usuario: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                },
              },
              // Attachments
              anexos: {
                orderBy: {
                  uploadedAt: "desc",
                },
              },
              // Families where this person is the responsible
              familiasResponsavel: {
                include: {
                  membros: {
                    include: {
                      individuo: {
                        select: {
                          id: true,
                          nomeCompleto: true,
                          cpf: true,
                          dataNascimento: true,
                          sexo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!citizen) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cidadão não encontrado",
            });
          }

          return citizen;
        },
        ctx.session.user.id
      );
    }),

  /**
   * Create new citizen profile
   * TÉCNICO and GESTOR access
   * Story 2.4: Create/Edit Profile
   *
   * - CPF uniqueness validation per tenant
   * - Auto-create Family if responsible
   * - Tenant isolation (NFR2)
   * - Audit trail (NFR5)
   */
  createCitizen: protectedProcedure
    .input(
      z.object({
        // Individuo fields
        nomeCompleto: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
        cpf: z
          .string()
          .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
          .transform((val) => val.replace(/\D/g, "")),
        dataNascimento: z.coerce.date(),
        sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
        nomeMae: z.string().optional(),
        nis: z
          .string()
          .regex(/^\d{11}$/, "NIS deve conter exatamente 11 dígitos")
          .optional()
          .transform((val) => (val ? val.replace(/\D/g, "") : undefined)),
        rg: z.string().optional(),
        tituloEleitor: z.string().optional(),
        carteiraTrabalho: z.string().optional(),

        // Family fields (optional - only if creating as responsavel)
        createAsResponsavel: z.boolean().default(false),
        endereco: z.string().optional(),
        rendaFamiliarTotal: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { createAsResponsavel, endereco, rendaFamiliarTotal, ...individuoData } = input;

          // Check CPF uniqueness within tenant
          const existingCitizen = await ctx.prisma.individuo.findUnique({
            where: {
              tenantId_cpf: {
                tenantId: ctx.session.user.tenantId,
                cpf: individuoData.cpf,
              },
            },
          });

          if (existingCitizen) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `CPF ${individuoData.cpf} já está cadastrado no sistema.`,
            });
          }

          // Create citizen and optionally family in transaction
          const result = await ctx.prisma.$transaction(async (tx) => {
            // Create Individuo
            const individuo = await tx.individuo.create({
              data: {
                ...individuoData,
                tenantId: ctx.session.user.tenantId,
                createdBy: ctx.session.user.id,
              },
            });

            // If creating as responsavel, create Family too
            if (createAsResponsavel) {
              const familia = await tx.familia.create({
                data: {
                  tenantId: ctx.session.user.tenantId,
                  responsavelFamiliarId: individuo.id,
                  endereco: endereco || "",
                  rendaFamiliarTotal: rendaFamiliarTotal ? rendaFamiliarTotal : null,
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

              return { individuo, familia };
            }

            return { individuo, familia: null };
          });

          return result;
        },
        ctx.session.user.id
      );
    }),

  /**
   * Update citizen profile
   * TÉCNICO and GESTOR access
   * Story 2.4: Create/Edit Profile
   *
   * - Update Individuo data
   * - CPF uniqueness validation (if changed)
   * - Audit trail via updatedAt
   * - Tenant isolation
   */
  updateCitizen: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        nomeCompleto: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
        cpf: z
          .string()
          .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
          .transform((val) => val.replace(/\D/g, "")),
        dataNascimento: z.coerce.date(),
        sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
        nomeMae: z.string().optional(),
        nis: z
          .string()
          .regex(/^\d{11}$/, "NIS deve conter exatamente 11 dígitos")
          .optional()
          .transform((val) => (val ? val.replace(/\D/g, "") : undefined)),
        rg: z.string().optional(),
        tituloEleitor: z.string().optional(),
        carteiraTrabalho: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { id, ...updateData } = input;

          // Verify citizen exists and belongs to tenant
          const existingCitizen = await ctx.prisma.individuo.findUnique({
            where: {
              id,
              tenantId: ctx.session.user.tenantId,
            },
          });

          if (!existingCitizen) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cidadão não encontrado",
            });
          }

          // If CPF changed, check uniqueness
          if (updateData.cpf !== existingCitizen.cpf) {
            const cpfExists = await ctx.prisma.individuo.findUnique({
              where: {
                tenantId_cpf: {
                  tenantId: ctx.session.user.tenantId,
                  cpf: updateData.cpf,
                },
              },
            });

            if (cpfExists) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `CPF ${updateData.cpf} já está cadastrado no sistema.`,
              });
            }
          }

          // Update citizen (updatedAt is auto-managed by Prisma)
          const updatedCitizen = await ctx.prisma.individuo.update({
            where: {
              id,
              tenantId: ctx.session.user.tenantId,
            },
            data: updateData,
          });

          return updatedCitizen;
        },
        ctx.session.user.id
      );
    }),

  /**
   * Add family member to existing family
   * TÉCNICO and GESTOR access
   * Story 2.4: Create/Edit Profile
   *
   * - Link existing Individuo to Familia
   * - Or create new Individuo and link
   * - Validate both familia and individuo belong to tenant
   */
  addFamilyMember: protectedProcedure
    .input(
      z.object({
        familiaId: z.string().cuid(),
        individuoId: z.string().cuid().optional(), // If linking existing
        parentesco: z.enum([
          "RESPONSAVEL",
          "CONJUGE",
          "FILHO",
          "ENTEADO",
          "NETO",
          "PAI_MAE",
          "SOGRO_SOGRA",
          "IRMAO_IRMA",
          "GENRO_NORA",
          "OUTRO",
        ]),
        // If creating new member
        newMember: z
          .object({
            nomeCompleto: z.string().min(3),
            cpf: z.string().regex(/^\d{11}$/),
            dataNascimento: z.coerce.date(),
            sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
            nomeMae: z.string().optional(),
            nis: z
              .string()
              .regex(/^\d{11}$/)
              .optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { familiaId, individuoId, newMember, parentesco } = input;

          // Verify familia exists and belongs to tenant
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

          // Handle linking existing OR creating new member
          let memberIdToLink: string;

          if (individuoId) {
            // Verify individuo exists and belongs to tenant
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

            memberIdToLink = individuoId;
          } else if (newMember) {
            // Check CPF uniqueness
            const cpfNormalized = newMember.cpf.replace(/\D/g, "");
            const existingCitizen = await ctx.prisma.individuo.findUnique({
              where: {
                tenantId_cpf: {
                  tenantId: ctx.session.user.tenantId,
                  cpf: cpfNormalized,
                },
              },
            });

            if (existingCitizen) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `CPF ${cpfNormalized} já está cadastrado no sistema.`,
              });
            }

            // Create new individuo
            const individuo = await ctx.prisma.individuo.create({
              data: {
                ...newMember,
                cpf: cpfNormalized,
                nis: newMember.nis?.replace(/\D/g, ""),
                tenantId: ctx.session.user.tenantId,
                createdBy: ctx.session.user.id,
              },
            });

            memberIdToLink = individuo.id;
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "É necessário fornecer individuoId ou dados do novo membro",
            });
          }

          // Check if already a member
          const existingComposition = await ctx.prisma.composicaoFamiliar.findUnique({
            where: {
              familiaId_individuoId: {
                familiaId,
                individuoId: memberIdToLink,
              },
            },
          });

          if (existingComposition) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Este cidadão já é membro desta família",
            });
          }

          // Add to family composition
          const composicao = await ctx.prisma.composicaoFamiliar.create({
            data: {
              familiaId,
              individuoId: memberIdToLink,
              parentesco,
            },
            include: {
              individuo: true,
            },
          });

          return composicao;
        },
        ctx.session.user.id
      );
    }),

  /**
   * Remove family member from family
   * TÉCNICO and GESTOR access
   * Story 2.4: Create/Edit Profile
   *
   * - Cannot remove responsavel (business rule)
   * - Soft delete via Cascade (removes from ComposicaoFamiliar only)
   */
  removeFamilyMember: protectedProcedure
    .input(
      z.object({
        familiaId: z.string().cuid(),
        individuoId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          const { familiaId, individuoId } = input;

          // Verify familia exists and belongs to tenant
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

          // Cannot remove responsavel
          if (familia.responsavelFamiliarId === individuoId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Não é possível remover o responsável familiar. Transfira a responsabilidade primeiro.",
            });
          }

          // Remove from composition
          await ctx.prisma.composicaoFamiliar.delete({
            where: {
              familiaId_individuoId: {
                familiaId,
                individuoId,
              },
            },
          });

          return { success: true };
        },
        ctx.session.user.id
      );
    }),
});
