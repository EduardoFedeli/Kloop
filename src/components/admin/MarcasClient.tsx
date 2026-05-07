"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { createBrand, toggleBrandStatus, deleteBrand } from "@/lib/actions/admin"
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

  async function handleDelete(id: string, count: number) {
    if (count > 0) {
      toast.error("Não é possível excluir uma marca que possui produtos vinculados.")
      return
    }
    if (!confirm("Tem certeza que deseja excluir esta marca?")) return

    startTransition(async () => {
      const res = await deleteBrand(id)
      if (res.error) toast.error(res.error)
      else toast.success("Marca excluída com sucesso!")
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
                  <td className="p-4 font-bold text-[var(--color-pine)]">{marca.name}</td>
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
                    <button
                      onClick={() => handleDelete(marca.id, marca._count.listings)}
                      disabled={isPending || marca._count.listings > 0}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-2"
                      title={marca._count.listings > 0 ? "Existem produtos com esta marca" : "Excluir marca"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Simples (Substitui navegação complexa) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newBrandName.trim()}
                  className="px-5 py-2 font-bold text-white bg-[var(--color-pine)] hover:bg-[var(--color-emerald)] rounded-lg transition-colors disabled:opacity-50"
                >
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