"use client"

import { useState, useTransition } from "react"
import {
  Store, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, PackageCheck,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { updateShopProduct, deleteShopProduct, markProductSold } from "@/lib/actions/kloopShop"
import { getConsignorShareRate } from "@/lib/kloopShopPayout"

interface ShopProduct {
  id: string
  name: string
  description: string | null
  priceCents: number
  condition: string
  isActive: boolean
  createdAt: string
  soldAt: string | null
  consignorPayoutCents: number | null
}

interface Props {
  products: ShopProduct[]
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom",
  FAIR: "Regular",
}

export function KloopShopClient({ products: initial }: Props) {
  const [products, setProducts] = useState<ShopProduct[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startEdit(product: ShopProduct) {
    setEditingId(product.id)
    setEditName(product.name)
    setEditPrice((product.priceCents / 100).toFixed(2).replace(".", ","))
    setEditDesc(product.description ?? "")
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  function saveEdit(productId: string) {
    const priceCents = Math.round(parseFloat(editPrice.replace(",", ".")) * 100)
    if (isNaN(priceCents) || priceCents <= 0) {
      setError("Preço inválido")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateShopProduct(productId, {
        name: editName,
        priceCents,
        description: editDesc || undefined,
      })
      if ("error" in result) { setError(result.error); return }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, name: editName, priceCents, description: editDesc || null }
            : p
        )
      )
      setEditingId(null)
    })
  }

  function toggleActive(product: ShopProduct) {
    startTransition(async () => {
      const result = await updateShopProduct(product.id, { isActive: !product.isActive })
      if ("error" in result) { setError(result.error); return }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      )
    })
  }

  function handleMarkSold(productId: string) {
    if (!confirm("Marcar este produto como vendido? O repasse ao consignante é calculado e travado nesse momento.")) return
    startTransition(async () => {
      const result = await markProductSold(productId)
      if ("error" in result) { setError(result.error); return }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, isActive: false, soldAt: new Date().toISOString(), consignorPayoutCents: Math.floor(p.priceCents * getConsignorShareRate(p.priceCents)) }
            : p
        )
      )
    })
  }

  function handleDelete(productId: string) {
    if (!confirm("Remover este produto da Kloop Shop?")) return
    startTransition(async () => {
      const result = await deleteShopProduct(productId)
      if ("error" in result) { setError(result.error); return }
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    })
  }

  const sold = products.filter((p) => p.soldAt).length
  const active = products.filter((p) => p.isActive && !p.soldAt).length
  const inactive = products.filter((p) => !p.isActive && !p.soldAt).length

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-gray-900">Kloop Shop</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {products.length} produto(s) · {active} ativo(s) · {inactive} inativo(s) · {sold} vendido(s)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Store size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum produto na Kloop Shop ainda.</p>
          <p className="text-[13px] text-gray-400 mt-1">Finalize um lote para publicar produtos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Produto</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Condição</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Preço</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Repasse</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const isEditing = editingId === product.id
                return (
                  <tr key={product.id} className={cn("transition-colors", isEditing ? "bg-blue-50/50" : "hover:bg-gray-50")}>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 text-[13px] font-bold focus:outline-none"
                          />
                          <input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Descrição (opcional)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 text-[12px] text-gray-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-gray-400 text-[11px] mt-0.5 truncate max-w-[240px]">{product.description}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {CONDITION_LABEL[product.condition] ?? product.condition}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-bold">R$</span>
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-blue-200 text-[13px] font-bold focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="font-black text-gray-900">{formatPrice(product.priceCents)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {product.soldAt ? (
                        <div>
                          <p className="font-black text-gray-900">{formatPrice(product.consignorPayoutCents ?? 0)}</p>
                          <p className="text-[10px] text-gray-400">
                            {Math.round(getConsignorShareRate(product.priceCents) * 100)}% pro consignante
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400">
                          {Math.round(getConsignorShareRate(product.priceCents) * 100)}% ao vender
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {product.soldAt ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 w-fit">
                          <PackageCheck size={13} /> Vendido
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleActive(product)}
                          disabled={isPending}
                          className={cn(
                            "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors",
                            product.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          )}
                        >
                          {product.isActive
                            ? <><ToggleRight size={13} /> Ativo</>
                            : <><ToggleLeft size={13} /> Inativo</>}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(product.id)}
                              disabled={isPending}
                              className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            {!product.soldAt && (
                              <button
                                onClick={() => handleMarkSold(product.id)}
                                disabled={isPending}
                                title="Marcar como vendido"
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-amber-100 hover:text-amber-700 transition-colors disabled:opacity-50"
                              >
                                <PackageCheck size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(product)}
                              disabled={!!product.soldAt}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors disabled:opacity-40"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={isPending}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
