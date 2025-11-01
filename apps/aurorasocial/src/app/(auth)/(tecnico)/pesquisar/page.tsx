import { auth } from "@/lib/auth";

export default async function PesquisarPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Pesquisa de Cidadãos</h1>
      <p className="mt-4 text-gray-600">
        Bem-vindo, {session?.user?.name} ({session?.user?.role})
      </p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Buscar Cidadão/Família</h2>
        <p className="mt-2 text-sm text-gray-600">
          Funcionalidade de pesquisa será implementada no Épico 2
        </p>
      </div>
    </div>
  );
}
