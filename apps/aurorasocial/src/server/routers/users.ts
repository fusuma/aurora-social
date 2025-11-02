/**
 * Users tRPC Router
 *
 * Provides GESTOR-only endpoints for user management:
 * - users.list - List all users in the same municipality (tenant)
 * - users.invite - Invite new user to the municipality (Story 1.5)
 * - users.deactivate - Deactivate user account (Story 1.6)
 * - users.reactivate - Reactivate user account (Story 1.6)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { gestorProcedure, router } from "../trpc";
import { withTenantContext } from "@/lib/tenant-context";
import { render } from "@react-email/components";
import { Resend } from "resend";
import UserInvitationEmail from "@/emails/user-invitation";

// Lazy-load Resend to avoid build-time errors
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export const usersRouter = router({
  /**
   * List all users in the current tenant (municipality)
   * GESTOR-only access
   * Automatic tenant isolation via Prisma middleware
   */
  list: gestorProcedure.query(async ({ ctx }) => {
    return await withTenantContext(
      ctx.session.user.tenantId,
      async () => {
        const users = await ctx.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return users;
      },
      ctx.session.user.id
    );
  }),

  /**
   * Invite new user to the municipality
   * GESTOR-only access
   * Story 1.5: Convidar Novo Usuário
   *
   * Creates user with PENDING status and sends invitation email with magic link
   */
  invite: gestorProcedure
    .input(
      z.object({
        email: z.string().email({ message: "Email inválido" }),
        role: z.enum(["GESTOR", "TECNICO"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          // Check if user already exists
          const existingUser = await ctx.prisma.user.findUnique({
            where: { email: input.email },
          });

          if (existingUser) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Já existe um usuário cadastrado com este email",
            });
          }

          // Get inviter details for email
          const inviter = await ctx.prisma.user.findUnique({
            where: { id: ctx.session.user.id },
            include: {
              tenant: {
                select: {
                  name: true,
                },
              },
            },
          });

          if (!inviter) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Erro ao buscar dados do convite",
            });
          }

          // Create new user with PENDING status
          const newUser = await ctx.prisma.user.create({
            data: {
              email: input.email.trim().toLowerCase(),
              name: input.email.split("@")[0], // Temporary name until user sets it
              role: input.role,
              status: "PENDING",
              tenantId: ctx.session.user.tenantId,
            },
          });

          // Generate verification token for magic link (NextAuth will handle this)
          const verificationToken = await ctx.prisma.verificationToken.create({
            data: {
              identifier: input.email.trim().toLowerCase(),
              token: crypto.randomUUID(),
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
          });

          // Create magic link
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
          const magicLink = `${baseUrl}/api/auth/callback/email?token=${verificationToken.token}&email=${encodeURIComponent(input.email)}`;

          // Send invitation email
          try {
            const emailHtml = await render(
              UserInvitationEmail({
                inviterName: inviter.name,
                municipalityName: inviter.tenant.name,
                role: input.role,
                magicLink,
              })
            );

            const resend = getResend();
            await resend.emails.send({
              from: process.env.EMAIL_FROM || "noreply@aurorasocial.com",
              to: input.email,
              subject: "Convite para AuroraSocial",
              html: emailHtml,
            });
          } catch (emailError) {
            console.error("Failed to send invitation email:", emailError);

            // Delete user and token if email fails
            await ctx.prisma.user.delete({ where: { id: newUser.id } });
            await ctx.prisma.verificationToken.delete({
              where: {
                identifier_token: {
                  identifier: verificationToken.identifier,
                  token: verificationToken.token,
                },
              },
            });

            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Falha ao enviar email de convite. Por favor, tente novamente.",
            });
          }

          return {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
          };
        },
        ctx.session.user.id
      );
    }),

  /**
   * Deactivate user account
   * GESTOR-only access
   * Story 1.6: Desativar Usuário
   *
   * - Sets user status to INACTIVE
   * - Prevents further login (handled in auth.ts)
   * - Deletes active sessions (immediate logout)
   * - Preserves user record (soft delete)
   * - Prevents self-deactivation
   */
  deactivate: gestorProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          // Prevent self-deactivation
          if (input.userId === ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Você não pode desativar sua própria conta",
            });
          }

          // Verify user belongs to same tenant
          const user = await ctx.prisma.user.findFirst({
            where: {
              id: input.userId,
              tenantId: ctx.session.user.tenantId,
            },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Usuário não encontrado",
            });
          }

          // Update user status to INACTIVE
          const updatedUser = await ctx.prisma.user.update({
            where: { id: input.userId },
            data: {
              status: "INACTIVE",
            },
          });

          // Delete active sessions to force logout
          await ctx.prisma.session.deleteMany({
            where: { userId: input.userId },
          });

          return updatedUser;
        },
        ctx.session.user.id
      );
    }),

  /**
   * Reactivate user account
   * GESTOR-only access
   * Story 1.6: Desativar Usuário (bonus functionality)
   *
   * - Sets user status to ACTIVE
   * - Allows user to log in again
   */
  reactivate: gestorProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await withTenantContext(
        ctx.session.user.tenantId,
        async () => {
          // Verify user belongs to same tenant
          const user = await ctx.prisma.user.findFirst({
            where: {
              id: input.userId,
              tenantId: ctx.session.user.tenantId,
            },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Usuário não encontrado",
            });
          }

          // Update user status to ACTIVE
          const updatedUser = await ctx.prisma.user.update({
            where: { id: input.userId },
            data: {
              status: "ACTIVE",
            },
          });

          return updatedUser;
        },
        ctx.session.user.id
      );
    }),
});
