"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { MapPin, Plus, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/profile"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { Address } from "@prisma/client"

type Props = {
  addresses: Address[]
}

export function AddressSection({ addresses }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createAddressAction(formData)
      if (result.success) {
        toast.success("Endereço adicionado!")
        setShowForm(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddressAction(addressId)
      if (result.success) {
        toast.success("Endereço padrão atualizado!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteAddressAction(deleteTarget)
    if (result.success) {
      toast.success("Endereço removido!")
    } else {
      toast.error(result.error)
    }
    setDeleteTarget(null)
  }

  const inputCls =
    "mt-1 w-full px-3 py-2 rounded-lg border border-teal-muted/40 text-sm focus:outline-none focus:border-teal bg-white"

  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <p className="text-sm text-teal-muted">Nenhum endereço cadastrado.</p>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border",
            addr.isDefault
              ? "border-teal bg-celadon/10"
              : "border-teal-muted/30 bg-white"
          )}
        >
          <MapPin size={18} className="mt-0.5 text-teal shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-airforce">{addr.label}</span>
              {addr.isDefault && (
                <span className="text-[10px] bg-teal text-white px-2 py-0.5 rounded-full font-semibold">
                  padrão
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {addr.street}, {addr.number}
              {addr.complement ? `, ${addr.complement}` : ""}
            </p>
            <p className="text-xs text-gray-500">
              {addr.neighborhood} — {addr.city}/{addr.state} — CEP {addr.zipCode}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!addr.isDefault && (
              <button
                onClick={() => handleSetDefault(addr.id)}
                disabled={isPending}
                className="p-1.5 text-teal-muted hover:text-teal transition-colors disabled:opacity-50"
                title="Definir como padrão"
              >
                <Star size={16} />
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(addr.id)}
              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-teal hover:text-airforce transition-colors"
        >
          <Plus size={16} />
          Adicionar endereço
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 p-4 rounded-xl border border-teal-muted/30 bg-linen"
        >
          <h3 className="text-sm font-bold text-airforce">Novo endereço</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-airforce">Rótulo</label>
              <input name="label" defaultValue="Casa" required maxLength={30} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">CEP</label>
              <input name="zipCode" required placeholder="00000-000" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-airforce">Rua</label>
              <input name="street" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">Número</label>
              <input name="number" required className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-airforce">Complemento</label>
            <input name="complement" placeholder="Apto, Bloco..." className={inputCls} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-airforce">Bairro</label>
              <input name="neighborhood" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">Cidade</label>
              <input name="city" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">UF</label>
              <input
                name="state"
                required
                maxLength={2}
                placeholder="SP"
                className={cn(inputCls, "uppercase")}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 text-sm text-airforce border border-teal-muted/40 rounded-lg hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 py-2 text-sm font-bold text-white rounded-lg transition-colors",
                isPending ? "bg-gray-400 cursor-not-allowed" : "bg-teal hover:bg-airforce"
              )}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Excluir endereço"
        description="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
