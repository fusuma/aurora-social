import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Both TECNICO and GESTOR can access TECNICO routes
  if (!session?.user?.role) {
    redirect("/login");
  }

  return <>{children}</>;
}
