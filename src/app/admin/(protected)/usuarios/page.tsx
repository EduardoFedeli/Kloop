import { getAdminUsers } from "@/lib/actions/admin"
import { UsuariosClient } from "@/components/admin/UsuariosClient"

export const metadata = {
  title: "Usuários | Kloop Admin",
}

export default async function UsuariosPage() {
  const usuarios = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-pine)]">Usuários</h1>
        <p className="text-sm text-gray-500">Veja e edite os usuários cadastrados na plataforma.</p>
      </div>

      <UsuariosClient initialUsers={usuarios} />
    </div>
  )
}
