"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, CheckCircle2, XCircle, ShoppingBag, PackageCheck,
  ArchiveX, ChevronRight, Plus, HelpCircle, Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

type LotStatus = "PENDING" | "RECEIVED" | "ANALYZING" | "ACTIVE" | "DONE"

interface LotData {
  code: string
  status: LotStatus
  shippingMethod: "CORREIOS" | "COLETA"
  createdAt: string
}

interface Props {
  lot?: LotData | null
}

interface MetricItem {
  icon: React.ElementType
  label: string
  sublabel: string
  count: number
  iconBg: string
  iconColor: string
}

const METRICS: MetricItem[] = [
  {
    icon: CheckCircle2,
    label: "Aprovar preços",
    sublabel: "a gente sugere, você bate o martelo",
    count: 0,
    iconBg: "bg-[var(--color-teal)]/10",
    iconColor: "text-[var(--color-teal)]",
  },
  {
    icon: XCircle,
    label: "Não aprovadas",
    sublabel: "você pode doar ou pegar de volta",
    count: 0,
    iconBg: "bg-red-100 dark:bg-red-500/10",
    iconColor: "text-red-500 dark:text-red-400",
  },
  {
    icon: ShoppingBag,
    label: "À venda",
    sublabel: "sua vitrine de sucesso",
    count: 0,
    iconBg: "bg-blue-100 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: PackageCheck,
    label: "Vendidas",
    sublabel: "yesssss!",
    count: 0,
    iconBg: "bg-green-100 dark:bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: ArchiveX,
    label: "Desativadas",
    sublabel: "não vendeu. doe ou pegue de volta",
    count: 0,
    iconBg: "bg-gray-100 dark:bg-white/5",
    iconColor: "text-gray-500 dark:text-sage",
  },
]

const STATUS_LABEL: Record<LotStatus, string> = {
  PENDING: "aguardando envio",
  RECEIVED: "pacote recebido",
  ANALYZING: "em análise",
  ACTIVE: "peças à venda",
  DONE: "lote finalizado",
}

const STATUS_DESCRIPTION: Record<LotStatus, string> = {
  PENDING: "Assim que recebermos suas peças, nossa equipe fotografa, avalia e publica os anúncios. Você será notificado em cada etapa.",
  RECEIVED: "Recebemos seu pacote! Nossa equipe está conferindo as peças.",
  ANALYZING: "Estamos fotografando e avaliando suas peças. Em breve os anúncios estarão no ar.",
  ACTIVE: "Suas peças estão à venda na plataforma. Acompanhe as métricas abaixo.",
  DONE: "Lote finalizado. Obrigado por vender com o Kloop Pro!",
}

const BLOCKED_STATUSES: LotStatus[] = ["PENDING", "RECEIVED", "ANALYZING"]

export function ProDashboardClient({ lot }: Props) {
  const router = useRouter()
  const isBlocked = lot ? BLOCKED_STATUSES.includes(lot.status) : false

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
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-1">
                  lote {lot.code}
                </p>
                <p className="text-[16px] font-black text-white mb-1">{STATUS_LABEL[lot.status]}</p>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  {STATUS_DESCRIPTION[lot.status]}
                </p>
              </div>
            </div>

            {/* Métricas */}
            <div className="space-y-2 mb-6">
              {METRICS.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", metric.iconBg)}>
                        <Icon size={18} className={metric.iconColor} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[var(--foreground)]">{metric.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5">{metric.sublabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-black text-[var(--foreground)]">{metric.count}</span>
                      <ChevronRight size={16} className="text-gray-200 dark:text-white/15" />
                    </div>
                  </div>
                )
              })}
            </div>

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
          /* Empty state */
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

        {/* Ajuda */}
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
