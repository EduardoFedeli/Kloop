"use client"

import { useState, useTransition } from "react"
import { Pencil, X, ShieldCheck, BadgeCheck } from "lucide-react"
import { updateAdminUser } from "@/lib/actions/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Usuario = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  isVerified: boolean
  createdAt: Date
  _count: { listings: number }
}

const ROLE_LABELS: Record<Usuario["role"], string> = {
  USER: "usuário",
  ADMIN: "admin",
  SUPER_ADMIN: "super admin",
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function UsuariosClient({ initialUsers }: { initialUsers: Usuario[] }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [name, setName] = useState("")
  const [role, setRole] = useState<Usuario["role"]>("USER")
  const [isVerified, setIsVerified] = useState(false)

  function openEdit(user: Usuario) {
    setEditing(user)
    setName(user.name)
    setRole(user.role)
    setIsVerified(user.isVerified)
  }

  function closeEdit() {
    setEditing(null)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || !name.trim()) return
    startTransition(async () => {
      const res = await updateAdminUser(editing.id, { name: name.trim(), role, isVerified })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Usuário atualizado!")
        closeEdit()
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <h2 className="font-bold text-gray-700">{initialUsers.length} usuários cadastrados</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Papel</th>
              <th className="p-4 font-semibold text-center">Verificado</th>
              <th className="p-4 font-semibold text-center">Anúncios</th>
              <th className="p-4 font-semibold">Cadastro</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">Nenhum usuário cadastrado ainda.</td>
              </tr>
            ) : (
              initialUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-[var(--color-pine)]">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                      u.role === "USER" ? "bg-gray-100 text-gray-500" : "bg-teal/10 text-teal"
                    )}>
                      {u.role !== "USER" && <ShieldCheck size={11} />}
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {u.isVerified ? (
                      <BadgeCheck size={16} className="inline text-teal" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-gray-600">{u._count.listings}</td>
                  <td className="p-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[var(--color-teal)] transition-colors"
                    >
                      <Pencil size={14} />
                      editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <button
              type="button"
              onClick={closeEdit}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-[var(--color-pine)]">Editar usuário</h3>
            <p className="text-xs text-gray-400">{editing.email}</p>

            <div>
              <label className="text-xs font-semibold text-gray-600">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Papel</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Usuario["role"])}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-teal)] bg-white"
              >
                <option value="USER">usuário</option>
                <option value="ADMIN">admin</option>
                <option value="SUPER_ADMIN">super admin</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded border-gray-300 text-teal focus:ring-teal"
              />
              email verificado
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
