"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { VendasCharts } from "./VendasCharts"

type Period = "7d" | "30d" | "90d" | "12m"

type KpiData = {
  gmv: number
  gmvChange: number | null
  commissionRevenue: number
  commissionChange: number | null
  cashbackCost: number
  netProfit: number
  transactionCount: number
  countChange: number | null
  avgTicket: number
  subscriptionCount: number
}

type TimeSeriesPoint = {
  week: string
  commission: number
  cashbackCost: number
  count: number
}

type TransactionRow = {
  id: string
  createdAt: string
  amountCents: number
  commissionCents: number
  cashbackUsedCents: number
  status: string
  paymentMethod: string | null
  buyer: { id: string; name: string }
  seller: { id: string; name: string; subscription: { plan: { slug: string } } | null }
  listing: { id: string; title: string }
}

type ApiResponse = {
  kpis: KpiData
  timeSeries: TimeSeriesPoint[]
  transactions: TransactionRow[]
  total: number
  page: number
  pages: number
}

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  "12m": "12 meses",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  AWAITING_PAYMENT: "Aguard. pagamento",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  DISPUTED: "Em disputa",
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PAID: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-teal-100 text-teal-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  REFUNDED: "bg-red-100 text-red-700",
  DISPUTED: "bg-red-200 text-red-800",
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  basic: { label: "Basic", cls: "bg-gray-100 text-gray-500" },
  pro: { label: "Pro", cls: "bg-emerald-100 text-emerald-700" },
  premium: { label: "Premium", cls: "bg-amber-100 text-amber-700" },
}

function KpiCard({
  label,
  value,
  change,
  highlight,
  sub,
}: {
  label: string
  value: string
  change?: number | null
  highlight?: "positive" | "negative"
  sub?: string
}) {
  const changeColor =
    change === null || change === undefined
      ? "text-gray-400"
      : change > 0
      ? "text-green-600"
      : change < 0
      ? "text-red-500"
      : "text-gray-400"

  const ChangeIcon =
    change === null || change === undefined ? Minus : change > 0 ? TrendingUp : TrendingDown

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 p-5", highlight === "negative" && "border-red-200 bg-red-50/30")}>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p
        className={cn(
          "text-[20px] font-black leading-none mb-1",
          highlight === "positive" && "text-green-700",
          highlight === "negative" && "text-red-600",
          !highlight && "text-gray-900"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mb-2">{sub}</p>}
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 text-[11px] font-bold", changeColor)}>
          <ChangeIcon size={11} />
          {change === null ? "—" : `${change > 0 ? "+" : ""}${change}%`}
          <span className="text-gray-400 font-normal">vs anterior</span>
        </div>
      )}
    </div>
  )
}

export function VendasClient() {
  const [period, setPeriod] = useState<Period>("30d")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      period,
      page: String(page),
      search,
      status: statusFilter,
    })
    const res = await fetch(`/api/admin/vendas?${params}`)
    const json = (await res.json()) as ApiResponse
    setData(json)
    setLoading(false)
  }, [period, page, search, statusFilter])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // TODO(titi): sem tabela de pagamentos de assinatura no schema atual.
  // Estimativa: assinantes ativos × R$29,90 (preço do plano Pro como proxy).
  const subscriptionRevenueCents = (data?.kpis.subscriptionCount ?? 0) * 2990

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-black text-gray-900">Painel Financeiro</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Receita, despesas e lucro do Kloop</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p)
                setPage(1)
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors",
                period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="GMV" value={formatPrice(data?.kpis.gmv ?? 0)} change={data?.kpis.gmvChange} sub="Volume bruto" />
        <KpiCard
          label="Receita Kloop"
          value={formatPrice(data?.kpis.commissionRevenue ?? 0)}
          change={data?.kpis.commissionChange}
          highlight="positive"
          sub="Comissão + ass."
        />
        <KpiCard label="Despesas Kloop" value={formatPrice(data?.kpis.cashbackCost ?? 0)} sub="Cashback pago" />
        <KpiCard
          label="Lucro Líquido"
          value={formatPrice(data?.kpis.netProfit ?? 0)}
          highlight={(data?.kpis.netProfit ?? 0) >= 0 ? "positive" : "negative"}
          sub="Receita − Despesas"
        />
        <KpiCard
          label="Transações"
          value={String(data?.kpis.transactionCount ?? 0)}
          change={data?.kpis.countChange}
          sub="Concluídas"
        />
        <KpiCard label="Ticket Médio" value={formatPrice(data?.kpis.avgTicket ?? 0)} sub="Por transação" />
      </div>

      {/* Charts */}
      {data && (
        <VendasCharts
          timeSeries={data.timeSeries}
          subscriptionRevenueCents={subscriptionRevenueCents}
          totalCommissionCents={data.kpis.commissionRevenue}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, usuário ou produto…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput)
                  setPage(1)
                }
              }}
              className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-teal-muted)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none bg-white"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-[13px]">Carregando…</div>
        ) : !data || data.transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-[13px]">Nenhuma transação encontrada</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["ID", "Data", "Comprador", "Vendedor", "Produto", "Bruto", "Comissão", "Cashback", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => {
                    const planSlug = t.seller.subscription?.plan.slug ?? "basic"
                    const planBadge = PLAN_BADGE[planSlug] ?? PLAN_BADGE["basic"]!
                    return (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-gray-500">{t.id.slice(0, 8)}…</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-800 font-medium whitespace-nowrap">
                          {t.buyer.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-gray-800 font-medium">{t.seller.name}</span>
                            <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-bold", planBadge.cls)}>
                              {planBadge.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 max-w-[160px] truncate">
                          {t.listing.title}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(t.amountCents)}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold text-green-700 whitespace-nowrap">
                          +{formatPrice(t.commissionCents)}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold text-red-500 whitespace-nowrap">
                          {t.cashbackUsedCents > 0 ? `-${formatPrice(t.cashbackUsedCents)}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-[11px] font-bold whitespace-nowrap",
                              STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-500"
                            )}
                          >
                            {STATUS_LABELS[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/vendas/${t.id}`}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[12px] text-gray-400">
                  {data.total} transações · página {data.page} de {data.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
