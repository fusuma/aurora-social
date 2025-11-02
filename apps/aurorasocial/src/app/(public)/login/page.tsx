import { LoginForm } from "@/components/modules/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | AuroraSocial",
  description: "Acesse o sistema AuroraSocial de forma segura",
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/";
  const error = params.error || null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm callbackUrl={callbackUrl} error={error} />
    </main>
  );
}
