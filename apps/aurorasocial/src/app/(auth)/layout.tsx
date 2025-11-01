import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Middleware already handles redirects to login, but double-check
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
