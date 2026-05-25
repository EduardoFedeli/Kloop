"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, CheckCircle, XCircle, Pencil, Check } from "lucide-react"
import { createBrand, toggleBrandStatus, deleteBrand, updateBrandName } from "@/lib/actions/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Marca = {
  id: string
  name: string
  slug: string
  isActive: boolean
  _count: { listings: number }
}

export function MarcasClient({ initialMarcas }: { initialMarcas: Marca[] }) {
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBrandName, setNewBrandName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newBrandName.trim()) return

    startTransition(async () => {
      const res = await createBrand({ name: newBrandName })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Marca criada com sucesso!")
        setNewBrandName("")
        setIsModalOpen(false)
      }
    })
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    startTransition(async () => {
      const res = await toggleBrandStatus(id, !currentStatus)
      if (res.error) toast.error(res.error)
      else toast.success(`Marca ${!currentStatus ? 'ativada' : 'desativada'}!`)
    })
  }

  function startEdit(marca: Marca) {
    setEditingId(marca.id)
    setEditingName(marca.name)
  }

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) return
    startTransition(async () => {
      const res = await updateBrandName(id, editingName.trim())
      if (res.error) toast.error(res.error)
      else {
        toast.success("Nome atualizado!")
        setEditingId(null)
      }
    })
  }

  async function handleDelete(id: string, name: string, count: number) {
    const msg = count > 0
      ? `Excluir "${name}" e seus ${count} produto(s) vinculado(s)? Esta ação não pode ser desfeita.`
      : `Excluir a marca "${name}"?`
    if (!confirm(msg)) return

    startTransition(async () => {
      const res = await deleteBrand(id)
      if (res.error) toast.error(res.error)
      else toast.success("Marca excluída!")
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-gray-700">Marcas Cadastradas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--color-airforce)] hover:bg-[var(--color-pine)] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          Nova Marca
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold text-center">Produtos</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialMarcas.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Nenhuma marca cadastrada ainda.</td>
              </tr>
            ) : (
              initialMarcas.map((marca) => (
                <tr key={marca.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-[var(--color-pine)]">
                    {editingId === marca.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(marca.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm font-bold w-40 focus:outline-none focus:ring-1 focus:ring-[var(--color-airforce)]"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(marca.id)} disabled={isPending} className="text-green-600 hover:text-green-700 p-1">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      marca.name
                    )}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{marca.slug}</td>
                  <td className="p-4 text-center">
                    <span className="bg-[var(--color-celadon)]/30 text-[var(--color-emerald)] px-2.5 py-1 rounded-md font-bold">
                      {marca._count.listings}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggle(marca.id, marca.isActive)}
                      disabled={isPending}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors",
                        marca.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200",
                        isPending && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {marca.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {marca.isActive ? "Ativa" : "Inativa"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(marca)}
                        disabled={isPending || editingId === marca.id}
                        className="text-blue-500 hover:text-blue-700 disabled:opacity-30 transition-colors p-2"
                        title="Editar nome"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(marca.id, marca.name, marca._count.listings)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors p-2"
                        title={marca._count.listings > 0 ? `Excluir marca e ${marca._count.listings} produto(s)` : "Excluir marca"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Adicionar Nova Marca</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--color-pine)] mb-1">Nome da Marca</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Ex: Nike, Zara, Farm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-airforce)]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending || !newBrandName.trim()} className="px-5 py-2 font-bold text-white bg-[var(--color-pine)] hover:bg-[var(--color-emerald)] rounded-lg transition-colors disabled:opacity-50">
                  {isPending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
