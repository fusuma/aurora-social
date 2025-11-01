import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import { render } from "@react-email/components";
import MagicLinkEmail from "@/emails/magic-link";
import { Resend } from "resend";
import type { Adapter } from "next-auth/adapters";

// Lazy-load Resend to avoid build-time errors
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          const emailHtml = await render(MagicLinkEmail({ url, email }));
          const resend = getResend();

          await resend.emails.send({
            from: process.env.EMAIL_FROM || "noreply@aurorasocial.com",
            to: email,
            subject: "Acesse o AuroraSocial",
            html: emailHtml,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours (rolling)
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Fetch user details including tenant and role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            tenantId: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.tenantId = dbUser.tenantId;
          session.user.role = dbUser.role;
          session.user.status = dbUser.status;
        }
      }
      return session;
    },
    async signIn({ user }) {
      // Block inactive users
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { status: true },
      });

      if (dbUser?.status === "INACTIVE") {
        return false;
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;

      // Default role-based redirects
      const session = await auth();
      if (session?.user?.role === "GESTOR") {
        return `${baseUrl}/dashboard`;
      }

      // TECNICO default
      return `${baseUrl}/pesquisar`;
    },
  },
});
