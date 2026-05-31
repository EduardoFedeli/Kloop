"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  ArrowLeft, CheckCircle2, XCircle, ShoppingBag,
  ChevronRight, Plus, HelpCircle, Package, Loader2,
  Clock, Sparkles, Gift, RotateCcw, Tag,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { setUserItemDecision, userConfirmItem } from "@/lib/actions/kloopShop"

type LotStatus = "PENDING" | "RECEIVED" | "ANALYZING" | "ACTIVE" | "DONE"

interface ApprovedItem {
  id: string
  name: string
  condition: string
  suggestedPriceCents: number | null
}

interface RejectedItem {
  id: string
  name: string
  adminNote: string | null
  userDecision: string | null
}

interface LotData {
  code: string
  status: LotStatus
  shippingMethod: "CORREIOS" | "COLETA"
  createdAt: string
  itemsTotal: number
  itemsApproved: number
  itemsPublished: number
  itemsRejected: number
  approvedItems: ApprovedItem[]
  rejectedItems: RejectedItem[]
}

interface Props {
  lot?: LotData | null
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo", LIKE_NEW: "Seminovo", GOOD: "Bom", FAIR: "Regular",
}

const STATUS_LABEL: Record<LotStatus, string> = {
  PENDING: "aguardando envio",
  RECEIVED: "pacote recebido",
  ANALYZING: "em análise",
  ACTIVE: "avaliação concluída",
  DONE: "lote finalizado",
}

const BLOCKED_STATUSES: LotStatus[] = ["PENDING", "RECEIVED", "ANALYZING"]

export function ProDashboardClient({ lot }: Props) {
  const router = useRouter()
  const [approvedDecisions, setApprovedDecisions] = useState<Record<string, "PUBLISH" | "DONATE" | "RETURN">>({})
  const [rejectedDecisions, setRejectedDecisions] = useState<Record<string, "DONATE" | "RETURN">>({})
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isBlocked = lot ? BLOCKED_STATUSES.includes(lot.status) : false
  const isAnalyzing = lot?.status === "ANALYZING"
  const isActive = lot?.status === "ACTIVE"
  const hasApprovedPending = (lot?.approvedItems.length ?? 0) > 0

  function handleApprovedDecision(itemId: string, choice: "PUBLISH" | "DONATE" | "RETURN") {
    setError(null)
    startTransition(async () => {
      const result = await userConfirmItem(itemId, choice)
      if ("error" in result) { setError(result.error); return }
      setApprovedDecisions((prev) => ({ ...prev, [itemId]: choice }))
    })
  }

  function handleRejectedDecision(itemId: string, decision: "DONATE" | "RETURN") {
    setError(null)
    startTransition(async () => {
      const result = await setUserItemDecision(itemId, decision)
      if ("error" in result) { setError(result.error); return }
      setRejectedDecisions((prev) => ({ ...prev, [itemId]: decision }))
    })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-[var(--foreground)]" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-black text-[var(--foreground)]">kloop</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-teal)] text-white text-[11px] font-black tracking-wide">PRO</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        <div className="mb-6">
          <h1 className="text-[20px] font-black text-[var(--foreground)] mb-1">meu painel Kloop Pro</h1>
          <p className="text-[13px] text-gray-500 dark:text-sage">acompanhe o status das suas peças</p>
        </div>

        {lot ? (
          <>
            {/* Banner status */}
            <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-1">lote {lot.code}</p>
                <p className="text-[16px] font-black text-white mb-1">{STATUS_LABEL[lot.status]}</p>
                {lot.itemsTotal > 0 && (
                  <p className="text-[11px] text-[var(--color-celadon)] mt-1 font-bold">{lot.itemsTotal} peça(s) enviadas</p>
                )}
              </div>
            </div>

            {/* Em análise */}
            {isAnalyzing && (
              <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-6 mb-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                  <Clock size={28} className="text-violet-500 dark:text-violet-400" />
                </div>
                <p className="text-[15px] font-black text-[var(--foreground)]">profissionais avaliando</p>
                <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed max-w-xs">
                  Nossa equipe está avaliando cada peça com carinho. Você receberá uma notificação quando a análise for concluída.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-[12px] text-red-600">{error}</p>
              </div>
            )}

            {/* Itens aprovados aguardando confirmação do usuário */}
            {isActive && hasApprovedPending && (
              <div className="mb-6">
                <div className="bg-[var(--color-frosted)] dark:bg-[var(--color-celadon)]/5 border border-[var(--color-celadon)]/40 rounded-2xl p-4 mb-3">
                  <p className="text-[14px] font-black text-[var(--foreground)] mb-0.5">sua aprovação é necessária</p>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed">
                    Para cada peça aprovada, você pode publicar com o preço sugerido, doar ou pedir de volta.
                  </p>
                </div>

                <div className="space-y-3">
                  {lot.approvedItems.map((item) => {
                    const decision = approvedDecisions[item.id]
                    return (
                      <div key={item.id} className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-[var(--foreground)] truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400">{CONDITION_LABEL[item.condition] ?? item.condition}</span>
                              {item.suggestedPriceCents && (
                                <span className="flex items-center gap-1 text-[11px] font-black text-[var(--color-teal)]">
                                  <Tag size={10} />
                                  sugestão: {formatPrice(item.suggestedPriceCents)}
                                </span>
                              )}
                            </div>
                          </div>
                          {decision === "PUBLISH" && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)] whitespace-nowrap flex-shrink-0">
                              <CheckCircle2 size={10} /> Publicada
                            </span>
                          )}
                          {decision === "DONATE" && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap flex-shrink-0">
                              <Gift size={10} /> Doada
                            </span>
                          )}
                          {decision === "RETURN" && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
                              <RotateCcw size={10} /> Devolver
                            </span>
                          )}
                        </div>

                        {!decision && (
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleApprovedDecision(item.id, "PUBLISH")}
                              disabled={isPending}
                              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[var(--color-teal)] text-white text-[11px] font-black hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {isPending ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                              {item.suggestedPriceCents ? formatPrice(item.suggestedPriceCents) : "Publicar"}
                            </button>
                            <button
                              onClick={() => handleApprovedDecision(item.id, "DONATE")}
                              disabled={isPending}
                              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <Gift size={14} />
                              Doar
                            </button>
                            <button
                              onClick={() => handleApprovedDecision(item.id, "RETURN")}
                              disabled={isPending}
                              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              <RotateCcw size={14} />
                              Devolver
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Publicadas na Kloop Shop */}
            {isActive && lot.itemsPublished > 0 && (
              <div className="bg-gradient-to-r from-[var(--color-pine)] to-[var(--color-emerald)] rounded-2xl p-5 mb-6 relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-15">
                  <Sparkles size={40} className="text-white" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-1">kloop shop</p>
                <p className="text-[15px] font-black text-white mb-1">{lot.itemsPublished} peça(s) à venda!</p>
                <p className="text-[12px] text-white/60">Suas peças estão na vitrine oficial da Kloop Shop.</p>
              </div>
            )}

            {/* Métricas resumidas */}
            {isActive && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { icon: ShoppingBag, label: "À venda", count: lot.itemsPublished, color: "text-[var(--color-teal)]", bg: "bg-[var(--color-teal)]/10" },
                  { icon: XCircle, label: "Não aprovadas", count: lot.itemsRejected, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/10" },
                  { icon: CheckCircle2, label: "Aprovadas", count: lot.itemsApproved, color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/10" },
                ].map((m) => {
                  const Icon = m.icon
                  return (
                    <div key={m.label} className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-3 flex flex-col items-center gap-1.5">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", m.bg)}>
                        <Icon size={16} className={m.color} />
                      </div>
                      <p className="text-[18px] font-black text-[var(--foreground)]">{m.count}</p>
                      <p className="text-[10px] text-gray-400 text-center leading-tight">{m.label}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Peças rejeitadas — decisão */}
            {isActive && lot.rejectedItems.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[14px] font-black text-[var(--foreground)] mb-3">o que fazer com as peças não aprovadas?</h2>
                <div className="space-y-2">
                  {lot.rejectedItems.map((item) => {
                    const decision = rejectedDecisions[item.id] ?? item.userDecision
                    return (
                      <div key={item.id} className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[var(--foreground)] truncate">{item.name}</p>
                            {item.adminNote && (
                              <p className="text-[11px] text-gray-400 mt-0.5 italic">&ldquo;{item.adminNote}&rdquo;</p>
                            )}
                          </div>
                          {decision === "DONATE" && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap flex-shrink-0">
                              <Gift size={10} /> Doada
                            </span>
                          )}
                          {decision === "RETURN" && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
                              <RotateCcw size={10} /> Devolver
                            </span>
                          )}
                        </div>
                        {!decision && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleRejectedDecision(item.id, "DONATE")}
                              disabled={isPending}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[12px] font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <Gift size={12} /> Quero doar
                            </button>
                            <button
                              onClick={() => handleRejectedDecision(item.id, "RETURN")}
                              disabled={isPending}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-[12px] font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              <RotateCcw size={12} /> Quero de volta
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Novo lote */}
            <div className="mb-4">
              {isBlocked ? (
                <div className="w-full py-4 bg-gray-100 dark:bg-white/5 rounded-2xl flex flex-col items-center gap-1 cursor-not-allowed">
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-gray-400 dark:text-white/20" />
                    <span className="font-black text-[14px] text-gray-400 dark:text-white/20">Enviar novo lote</span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-white/30">aguarde a análise do lote atual</p>
                </div>
              ) : (
                <Link
                  href="/pro/anuncio"
                  className="w-full py-4 bg-[var(--color-teal)] text-white rounded-2xl font-black text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-teal)]/20 block text-center"
                >
                  <Plus size={18} />
                  Enviar novo lote
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
              <Package size={32} className="text-[var(--color-teal)]" />
            </div>
            <h2 className="text-[18px] font-black text-[var(--foreground)] mb-2">nenhum lote ativo</h2>
            <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-xs mb-8">
              Você ainda não enviou nenhum lote para o Kloop Pro. Envie suas peças e a gente cuida do resto.
            </p>
            <Link
              href="/pro"
              className="px-8 py-4 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/20"
            >
              Venda no Kloop Pro
            </Link>
          </div>
        )}

        <Link
          href="/ajuda"
          className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">central de ajuda</p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5">dúvidas sobre o Kloop Pro?</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-200 dark:text-white/15" />
        </Link>

      </div>
    </div>
  )
}
