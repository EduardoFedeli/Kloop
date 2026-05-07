import { getAdminBrands } from "@/lib/actions/admin"
import { MarcasClient } from "@/components/admin/MarcasClient"

export const metadata = {
  title: "Gerenciar Marcas | Kloop Admin",
}

export default async function MarcasPage() {
  const marcas = await getAdminBrands()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-pine)]">Gerenciar Marcas</h1>
        <p className="text-sm text-gray-500">Adicione, edite ou desative as marcas disponíveis no formulário de produtos.</p>
      </div>

      <MarcasClient initialMarcas={marcas} />
    </div>
  )
}