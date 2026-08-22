import { getAdminCommunities } from "@/lib/actions/admin"
import { ComunidadesClient } from "@/components/admin/ComunidadesClient"

export const metadata = {
  title: "Comunidades | Kloop Admin",
}

export default async function ComunidadesPage() {
  const comunidades = await getAdminCommunities()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-pine)]">Comunidades</h1>
        <p className="text-sm text-gray-500">Crie e gerencie as comunidades atendidas pelo Kloop.</p>
      </div>

      <ComunidadesClient initialCommunities={comunidades} />
    </div>
  )
}
