/**
 * User Invitation Email Template
 *
 * Story 1.5: Convidar Novo Usuário
 *
 * Sent when a GESTOR invites a new user to join their municipality.
 * Includes magic link for first-time login and account setup.
 */

import { Html, Button, Text, Container, Section, Heading } from "@react-email/components";

interface UserInvitationEmailProps {
  inviterName: string;
  municipalityName: string;
  role: "GESTOR" | "TECNICO";
  magicLink: string;
}

export default function UserInvitationEmail({
  inviterName,
  municipalityName,
  role,
  magicLink,
}: UserInvitationEmailProps) {
  const roleLabel = role === "GESTOR" ? "Gestor Público" : "Técnico";

  return (
    <Html lang="pt-BR">
      <Container
        style={{
          margin: "0 auto",
          padding: "20px 0 48px",
          maxWidth: "560px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Você foi convidado para o AuroraSocial
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Olá!
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            <strong>{inviterName}</strong> convidou você para participar do sistema AuroraSocial de{" "}
            <strong>{municipalityName}</strong>.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#374151",
              marginBottom: "24px",
            }}
          >
            Você foi cadastrado com o papel de <strong>{roleLabel}</strong>.
          </Text>

          <Button
            href={magicLink}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              textAlign: "center",
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: "6px",
            }}
          >
            Aceitar Convite e Acessar Sistema
          </Button>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#6b7280",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            Este link de convite expira em 7 dias.
          </Text>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Ao acessar pela primeira vez, você poderá configurar seu perfil e começar a usar o
            sistema de gestão social.
          </Text>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Se você não esperava este convite ou não reconhece <strong>{municipalityName}</strong>,
            pode ignorar este email com segurança.
          </Text>
        </Section>

        <Text
          style={{
            fontSize: "12px",
            lineHeight: "16px",
            color: "#9ca3af",
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          AuroraSocial - Sistema de Gestão Social
        </Text>
      </Container>
    </Html>
  );
}

export const UserInvitationEmailPreview = () => (
  <UserInvitationEmail
    inviterName="Maria Silva"
    municipalityName="Município de São Paulo"
    role="TECNICO"
    magicLink="https://example.com/auth/callback?token=abc123"
  />
);
