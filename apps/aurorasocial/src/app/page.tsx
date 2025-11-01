import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // Redirect based on role
  if (session?.user) {
    if (session.user.role === "GESTOR") {
      redirect("/dashboard");
    } else {
      redirect("/pesquisar");
    }
  }

  // Not authenticated - redirect to login
  redirect("/login");
}
