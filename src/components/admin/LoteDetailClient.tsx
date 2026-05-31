"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, CheckCircle2, XCircle, Package,
  ChevronDown, AlertTriangle, Loader2,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { approveLotItem, rejectLotItem, finalizeLot } from "@/lib/actions/kloopShop"

type ItemStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED"
type LotStatus = "PENDING" | "RECEIVED" | "ANALYZING" | "ACTIVE" | "DONE"

interface LotItem {
  id: string
  name: string
  description: string | null
  condition: string
  status: ItemStatus
  suggestedPriceCents: number | null
  adminNote: string | null
}

interface LotDetail {
  id: string
  code: string
  status: LotStatus
  shippingMethod: string
  withBag: boolean
  createdAt: string
  user: { name: string; email: string }
  items: LotItem[]
}

interface Props {
  lot: LotDetail
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom",
  FAIR: "Regular",
}

const REJECTION_REASONS = [
  "Mancha",
  "Rasgo",
  "Desgaste excessivo",
  "Bolinhas de tecido",
  "Odor forte",
  "Não informado",
  "Item não aceito",
  "Botão faltando",
  "Zíper quebrado",
]

export function LoteDetailClient({ lot }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<LotItem[]>(lot.items)
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pending = items.filter((i) => i.status === "PENDING_REVIEW").length
  const approved = items.filter((i) => i.status === "APPROVED").length
  const rejected = items.filter((i) => i.status === "REJECTED").length
  const canFinalize = pending === 0 && approved > 0 && lot.status === "ANALYZING"

  function updateItem(id: string, patch: Partial<LotItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function handleApprove(item: LotItem) {
    const rawPrice = prices[item.id] ?? ""
    const priceCents = Math.round(parseFloat(rawPrice.replace(",", ".")) * 100)
    if (!rawPrice || isNaN(priceCents) || priceCents <= 0) {
      setError(`Informe um preço válido para "${item.name}"`)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await approveLotItem(item.id, priceCents)
      if ("error" in result) { setError(result.error); return }
      updateItem(item.id, { status: "APPROVED", suggestedPriceCents: priceCents })
      setExpanded(null)
    })
  }

  function handleReject(item: LotItem) {
    const note = notes[item.id] ?? ""
    if (!note.trim()) {
      setError(`Selecione ou informe um motivo para rejeitar "${item.name}"`)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await rejectLotItem(item.id, note)
      if ("error" in result) { setError(result.error); return }
      updateItem(item.id, { status: "REJECTED", adminNote: note })
      setExpanded(null)
    })
  }

  function handleFinalize() {
    setFinalizing(true)
    setError(null)
    startTransition(async () => {
      const result = await finalizeLot(lot.id)
      if ("error" in result) { setError(result.error); setFinalizing(false); return }
      router.push("/admin/lotes")
    })
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-[20px] font-black text-gray-900 leading-none">Lote {lot.code}</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{lot.user.name} · {lot.user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Aguardando", value: pending, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Aprovadas", value: approved, color: "text-green-700 bg-green-50 border-green-100" },
          { label: "Rejeitadas", value: rejected, color: "text-red-600 bg-red-50 border-red-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={cn("rounded-2xl border p-4 text-center", color)}>
            <p className="text-[28px] font-black leading-none">{value}</p>
            <p className="text-[12px] font-bold mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {/* Items */}
      <div className="space-y-2 mb-6">
        {items.map((item) => {
          const isExpanded = expanded === item.id
          const isApproved = item.status === "APPROVED"
          const isRejected = item.status === "REJECTED"

          return (
            <div
              key={item.id}
              className={cn(
                "bg-white rounded-2xl border overflow-hidden transition-all",
                isApproved && "border-green-200",
                isRejected && "border-red-200",
                !isApproved && !isRejected && "border-gray-100"
              )}
            >
              {/* Row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isApproved ? "bg-green-100" : isRejected ? "bg-red-100" : "bg-gray-100"
                  )}>
                    {isApproved ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : isRejected ? (
                      <XCircle size={16} className="text-red-500" />
                    ) : (
                      <Package size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {CONDITION_LABEL[item.condition]}
                      {isApproved && item.suggestedPriceCents && (
                        <span className="ml-2 text-green-600 font-bold">→ {formatPrice(item.suggestedPriceCents)}</span>
                      )}
                      {isRejected && item.adminNote && (
                        <span className="ml-2 text-red-400 italic">&ldquo;{item.adminNote}&rdquo;</span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={cn("text-gray-300 flex-shrink-0 transition-transform", isExpanded && "rotate-180")}
                />
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  {item.description && (
                    <p className="text-[12px] text-gray-500 mt-3 mb-4 leading-relaxed">{item.description}</p>
                  )}

                  {item.status === "PENDING_REVIEW" && (
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400 font-bold">R$</span>
                          <input
                            type="number"
                            placeholder="0,00"
                            min="0"
                            step="0.01"
                            value={prices[item.id] ?? ""}
                            onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[var(--color-teal)]"
                          />
                        </div>
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-teal)] text-white text-[12px] font-black hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                        >
                          {isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Aprovar
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Motivo da rejeição (obrigatório)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {REJECTION_REASONS.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setNotes((n) => ({ ...n, [item.id]: reason }))}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all",
                                notes[item.id] === reason
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500"
                              )}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ou escreva outro motivo..."
                            value={notes[item.id] ?? ""}
                            onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 focus:outline-none focus:border-red-300"
                          />
                          <button
                            onClick={() => handleReject(item)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-[12px] font-black hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.status !== "PENDING_REVIEW" && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          updateItem(item.id, { status: "PENDING_REVIEW", suggestedPriceCents: null, adminNote: null })
                          startTransition(async () => {
                            await rejectLotItem(item.id, undefined)
                          })
                        }}
                        className="text-[12px] text-gray-400 hover:text-gray-600 underline"
                      >
                        Desfazer decisão
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Finalize */}
      {lot.status === "ANALYZING" && (
        <div className={cn(
          "rounded-2xl p-5 border",
          canFinalize
            ? "bg-[var(--color-frosted)] border-[var(--color-celadon)]/50"
            : "bg-gray-50 border-gray-100"
        )}>
          <p className="text-[13px] font-bold text-gray-700 mb-1">
            {canFinalize
              ? `${approved} peça(s) prontas para publicar na Kloop Shop`
              : pending > 0
                ? `Avalie as ${pending} peça(s) restantes antes de finalizar`
                : "Nenhuma peça aprovada — revise as decisões"}
          </p>
          <p className="text-[12px] text-gray-400 mb-4">
            {canFinalize
              ? "As peças aprovadas serão publicadas na Kloop Shop e o usuário poderá ver o resultado no painel dele."
              : "Todas as peças precisam ter uma decisão (aprovada ou rejeitada) antes de finalizar."}
          </p>
          <button
            onClick={handleFinalize}
            disabled={!canFinalize || finalizing}
            className={cn(
              "w-full py-3.5 rounded-xl font-black text-[14px] flex items-center justify-center gap-2 transition-all",
              canFinalize && !finalizing
                ? "bg-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/20 hover:opacity-90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {finalizing && <Loader2 size={16} className="animate-spin" />}
            {finalizing ? "Publicando..." : "Finalizar e publicar na Kloop Shop"}
          </button>
        </div>
      )}

      {lot.status === "ACTIVE" && (
        <div className="rounded-2xl p-5 bg-green-50 border border-green-200 text-center">
          <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
          <p className="text-[14px] font-black text-green-700">Lote finalizado</p>
          <p className="text-[12px] text-green-600 mt-1">{approved} peças publicadas na Kloop Shop</p>
        </div>
      )}
    </div>
  )
}
