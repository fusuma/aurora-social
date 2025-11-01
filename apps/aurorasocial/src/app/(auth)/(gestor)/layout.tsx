import { auth } from "@/lib/auth";
import AccessDenied from "@/components/modules/auth/AccessDenied";

export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Check if user has GESTOR role
  if (session?.user?.role !== "GESTOR") {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
