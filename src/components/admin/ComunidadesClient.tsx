"use client"

import { useState, useTransition } from "react"
import { Plus, Building2, Dumbbell, Briefcase, X, Search, Check } from "lucide-react"
import { createCommunity, searchAdminUsers } from "@/lib/actions/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Comunidade = {
  id: string
  name: string
  slug: string
  isActive: boolean
  admin: { id: string; name: string | null; email: string | null }
  _count: { members: number }
}

type UserOption = { id: string; name: string | null; email: string | null; avatarUrl: string | null }

const TYPES = [
  { key: "condominio", label: "Condomínio", icon: Building2, available: true },
  { key: "academia", label: "Academia", icon: Dumbbell, available: false },
  { key: "empresa", label: "Empresa", icon: Briefcase, available: false },
] as const

export function ComunidadesClient({ initialCommunities }: { initialCommunities: Comunidade[] }) {
  const [isPending, startTransition] = useTransition()
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [userQuery, setUserQuery] = useState("")
  const [userOptions, setUserOptions] = useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [searching, setSearching] = useState(false)

  async function handleUserSearch(value: string) {
    setUserQuery(value)
    setSelectedUser(null)
    if (value.trim().length < 2) {
      setUserOptions([])
      return
    }
    setSearching(true)
    const results = await searchAdminUsers(value)
    setSearching(false)
    setUserOptions(results)
  }

  function openCondominioForm() {
    setIsTypeModalOpen(false)
    setIsFormModalOpen(true)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setName("")
    setDescription("")
    setUserQuery("")
    setUserOptions([])
    setSelectedUser(null)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selectedUser) return
    startTransition(async () => {
      const res = await createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        adminUserId: selectedUser.id,
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Comunidade criada com sucesso!")
        closeFormModal()
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-gray-700">Comunidades Cadastradas</h2>
        <button
          onClick={() => setIsTypeModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--color-airforce)] hover:bg-[var(--color-pine)] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          Nova Comunidade
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold">Administrador</th>
              <th className="p-4 font-semibold text-center">Membros</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {initialCommunities.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Nenhuma comunidade cadastrada ainda.</td>
              </tr>
            ) : (
              initialCommunities.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-[var(--color-pine)]">{c.name}</td>
                  <td className="p-4 text-gray-500">{c.slug}</td>
                  <td className="p-4 text-gray-600">{c.admin.name ?? c.admin.email}</td>
                  <td className="p-4 text-center text-gray-600">{c._count.members}</td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-xs font-bold",
                      c.isActive ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray-500"
                    )}>
                      {c.isActive ? "ativa" : "inativa"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: escolher tipo de comunidade */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsTypeModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-[var(--color-pine)] mb-1">Criar comunidade</h3>
            <p className="text-sm text-gray-500 mb-5">Escolha o tipo de comunidade que você quer criar.</p>

            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ key, label, icon: Icon, available }) => (
                <button
                  key={key}
                  type="button"
                  disabled={!available}
                  onClick={available ? openCondominioForm : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-5 text-sm font-bold transition-colors",
                    available
                      ? "border-gray-200 text-[var(--color-pine)] hover:border-[var(--color-teal)] hover:bg-teal/5 cursor-pointer"
                      : "border-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  {!available && (
                    <span className="absolute -top-2 right-2 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      em breve
                    </span>
                  )}
                  <Icon size={22} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: formulário de criação (Condomínio) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <button
              type="button"
              onClick={closeFormModal}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-[var(--color-pine)]">Novo condomínio</h3>

            <div>
              <label className="text-xs font-semibold text-gray-600">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Condomínio Jardins"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Descrição <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Breve descrição da comunidade"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-teal)] resize-none"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-600">Administrador da comunidade</label>
              {selectedUser ? (
                <div className="mt-1 flex items-center justify-between rounded-lg border border-teal bg-teal/5 px-3 py-2 text-sm">
                  <span className="font-medium text-[var(--color-pine)]">{selectedUser.name ?? selectedUser.email}</span>
                  <button type="button" onClick={() => { setSelectedUser(null); setUserQuery("") }} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={userQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Buscar por nome ou email"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-teal)]"
                  />
                </div>
              )}
              {!selectedUser && userQuery.trim().length >= 2 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {searching && <p className="p-3 text-xs text-gray-400">buscando...</p>}
                  {!searching && userOptions.length === 0 && (
                    <p className="p-3 text-xs text-gray-400">nenhum usuário encontrado</p>
                  )}
                  {userOptions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setSelectedUser(u); setUserOptions([]) }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span>
                        <span className="font-medium text-[var(--color-pine)]">{u.name}</span>
                        <span className="block text-xs text-gray-400">{u.email}</span>
                      </span>
                      <Check size={14} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !name.trim() || !selectedUser}
              className="w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
            >
              {isPending ? "Criando..." : "Criar comunidade"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
