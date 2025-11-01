import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Gerencial</h1>
      <p className="mt-4 text-gray-600">Bem-vindo, {session?.user?.name} (Gestor)</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Métricas-Chave</h2>
        <p className="mt-2 text-sm text-gray-600">
          Dashboard de métricas será implementado na História 3.4
        </p>
      </div>
    </div>
  );
}
