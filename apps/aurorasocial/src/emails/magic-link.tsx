import { Html, Button, Text, Container, Section, Heading } from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  email: string;
}

export default function MagicLinkEmail({ url, email }: MagicLinkEmailProps) {
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
            Acesse o AuroraSocial
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
              marginBottom: "24px",
            }}
          >
            Você solicitou acesso ao sistema AuroraSocial com o email <strong>{email}</strong>.
            Clique no botão abaixo para fazer login de forma segura.
          </Text>

          <Button
            href={url}
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
            Fazer Login
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
            Este link expira em 24 horas e só pode ser usado uma vez.
          </Text>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Se você não solicitou este acesso, pode ignorar este email com segurança.
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

export const MagicLinkEmailPreview = () => (
  <MagicLinkEmail url="https://example.com/auth/callback" email="usuario@exemplo.com" />
);
