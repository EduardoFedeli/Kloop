"use client"

/**
 * Simulador Financeiro Kloop
 *
 * Modelo matemático (documentado por mês m = 1..horizonte*12):
 *
 *   usuariosAtivos(m) = usuariosBase × (1 + crescimentoMensal%)^m
 *   transacoes(m)     = usuariosAtivos × txPorUsuario
 *   gmv(m)            = transacoes × ticketMedio
 *   comissao(m)       = gmv × weightedCommissionRate
 *                       onde weightedCommissionRate = free×10% + pro×5% + premium×3%
 *   receita_assin(m)  = activeSubscribers × (pro×R$29,90 + premium×R$59,90)
 *                       activeSubscribers sofre churn mensal e reposição pelo crescimento
 *   cashback(m)       = gmv × 0.05 × (cashbackUserPct/100)
 *                       cashback flat: seller 3% + buyer 2% = 5% (igual para todos os tiers)
 *   despesa(m)        = cashback(m) + custosFixos
 *   lucro(m)          = comissao(m) + receita_assin(m) - despesa(m)
 *   lucroAcum(m)      = lucroAcum(m-1) + lucro(m)
 *
 *   Break-even: primeiro m onde lucroAcum(m) >= 0
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { cn, formatPrice } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Save, Trash2 } from "lucide-react"
import { z } from "zod"

// ── Types ──────────────────────────────────────────────────────────────────

const ScenarioSchema = z.object({
  name: z.string().min(1),
  usuariosBase: z.number().int().min(1).max(10_000_000),
  crescimentoMensal: z.number().min(0).max(100),
  freePct: z.number().min(0).max(100),
  proPct: z.number().min(0).max(100),
  premiumPct: z.number().min(0).max(100),
  txPorUsuario: z.number().min(0.1).max(50),
  ticketMedioCents: z.number().int().min(1000).max(500_000),
  cashbackUserPct: z.number().min(0).max(100),
  custosFixosCents: z.number().int().min(0),
  horizonte: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]),
  churnMensal: z.number().min(0).max(100),
})

type Scenario = z.infer<typeof ScenarioSchema>
type SavedScenario = Scenario & { id: string; savedAt: string }

type MonthPoint = {
  month: number
  label: string
  revenue: number
  subscriptionRevenue: number
  cashbackCost: number
  totalExpense: number
  profit: number
  cumProfit: number
  users: number
}

// ── Default ────────────────────────────────────────────────────────────────

const DEFAULT: Scenario = {
  name: "Cenário Base",
  usuariosBase: 500,
  crescimentoMensal: 8,
  freePct: 70,
  proPct: 25,
  premiumPct: 5,
  txPorUsuario: 1.5,
  ticketMedioCents: 15000,
  cashbackUserPct: 15,
  custosFixosCents: 0,
  horizonte: 3,
  churnMensal: 5,
}

const STORAGE_KEY = "kloop-simulador-scenarios"

function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedScenario[]) : []
  } catch {
    return []
  }
}

function saveScenarios(scenarios: SavedScenario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
}

// ── Math engine ────────────────────────────────────────────────────────────

function simulate(s: Scenario): MonthPoint[] {
  const months = s.horizonte * 12
  const growthRate = s.crescimentoMensal / 100
  const churnRate = s.churnMensal / 100
  const freeFrac = s.freePct / 100
  const proFrac = s.proPct / 100
  const premiumFrac = s.premiumPct / 100

  const commissionRate = freeFrac * 0.10 + proFrac * 0.05 + premiumFrac * 0.03
  const cashbackRate = 0.05 // flat: seller 3% + buyer 2% para todos os tiers
  const subscriptionRevenuePerUser = proFrac * 2990 + premiumFrac * 5990

  let cumProfit = 0
  let activeSubscribers = s.usuariosBase * (proFrac + premiumFrac)

  return Array.from({ length: months }, (_, idx) => {
    const m = idx + 1
    const users = Math.round(s.usuariosBase * Math.pow(1 + growthRate, m))
    const transactions = users * s.txPorUsuario
    const gmv = transactions * s.ticketMedioCents

    const revenue = Math.round(gmv * commissionRate)

    activeSubscribers = activeSubscribers * (1 - churnRate) + users * (proFrac + premiumFrac) * growthRate
    const subscriptionRevenue = Math.round(Math.max(0, activeSubscribers) * subscriptionRevenuePerUser)

    const cashbackCost = Math.round(gmv * cashbackRate * (s.cashbackUserPct / 100))
    const totalExpense = cashbackCost + s.custosFixosCents
    const profit = revenue + subscriptionRevenue - totalExpense

    cumProfit += profit

    const year = Math.ceil(m / 12)
    const monthInYear = ((m - 1) % 12) + 1
    const label = s.horizonte <= 1 ? `M${m}` : `A${year}M${monthInYear}`

    return { month: m, label, revenue, subscriptionRevenue, cashbackCost, totalExpense, profit, cumProfit: Math.round(cumProfit), users }
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatShort(cents: number): string {
  const abs = Math.abs(cents)
  if (abs >= 1_000_000_00) return `R$${(cents / 1_000_000_00).toFixed(1)}M`
  if (abs >= 100_000) return `R$${(cents / 100_000).toFixed(1)}k`
  return formatBRL(cents)
}

// ── Slider ─────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[12px] font-bold text-gray-600">{label}</label>
        <span className="text-[12px] font-black text-gray-900">{value.toLocaleString("pt-BR")}{unit ?? ""}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-teal)]" />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export function SimuladorClient() {
  const [s, setS] = useState<Scenario>(DEFAULT)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [scenarioName, setScenarioName] = useState("")

  useEffect(() => { setSavedScenarios(loadScenarios()) }, [])

  const update = useCallback((patch: Partial<Scenario>) => {
    setS((prev) => {
      const next = { ...prev, ...patch }
      if ("proPct" in patch || "premiumPct" in patch) {
        next.freePct = Math.max(0, 100 - next.proPct - next.premiumPct)
      }
      return next
    })
  }, [])

  const points = useMemo(() => simulate(s), [s])
  const displayPoints = points.length <= 120 ? points : points.filter((_, i) => i % Math.ceil(points.length / 120) === 0 || i === points.length - 1)

  const lastPoint = points[points.length - 1]!
  const breakEvenIdx = points.findIndex((p) => p.cumProfit >= 0)
  const isViable = breakEvenIdx !== -1
  const totalRevenue = points.reduce((sum, p) => sum + p.revenue + p.subscriptionRevenue, 0)
  const totalExpense = points.reduce((sum, p) => sum + p.totalExpense, 0)

  const yearSummary = Array.from({ length: s.horizonte }, (_, yi) => {
    const yp = points.slice(yi * 12, (yi + 1) * 12)
    return {
      year: yi + 1,
      users: yp[yp.length - 1]?.users ?? 0,
      revenue: yp.reduce((t, p) => t + p.revenue + p.subscriptionRevenue, 0),
      expense: yp.reduce((t, p) => t + p.totalExpense, 0),
      profit: yp.reduce((t, p) => t + p.profit, 0),
      cumProfit: yp[yp.length - 1]?.cumProfit ?? 0,
    }
  })

  function handleSave() {
    const name = scenarioName.trim() || s.name
    const sc: SavedScenario = { ...s, id: Date.now().toString(), name, savedAt: new Date().toISOString() }
    const updated = [...savedScenarios, sc]
    setSavedScenarios(updated)
    saveScenarios(updated)
    setScenarioName("")
  }

  function handleDelete(id: string) {
    const updated = savedScenarios.filter((sc) => sc.id !== id)
    setSavedScenarios(updated)
    saveScenarios(updated)
  }

  function handleLoad(sc: SavedScenario) {
    const { id: _id, savedAt: _sa, ...scenario } = sc
    void _id; void _sa
    setS(scenario)
  }

  const HORIZONTE_OPTIONS = [1, 3, 5, 10] as const

  return (
    <div className="max-w-7xl">
      <div className="mb-5">
        <h1 className="text-[22px] font-black text-gray-900">Simulador de Viabilidade</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Projeção financeira do modelo de negócios Kloop</p>
      </div>

      {/* Cenários salvos */}
      {savedScenarios.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {savedScenarios.map((sc) => (
            <div key={sc.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
              <button onClick={() => handleLoad(sc)} className="text-[12px] font-bold text-gray-700 hover:text-[var(--color-teal)] transition-colors">
                {sc.name}
              </button>
              <button onClick={() => handleDelete(sc.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 items-start">
        {/* Inputs */}
        <div className="w-72 flex-shrink-0 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Base de usuários</p>
            <Slider label="Usuários iniciais" value={s.usuariosBase} min={10} max={100000} step={10} onChange={(v) => update({ usuariosBase: v })} />
            <Slider label="Crescimento mensal" value={s.crescimentoMensal} min={0} max={50} step={0.5} unit="%" onChange={(v) => update({ crescimentoMensal: v })} />
            <Slider label="Churn de assinantes" value={s.churnMensal} min={0} max={30} step={0.5} unit="%/mês" onChange={(v) => update({ churnMensal: v })} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Mix de tiers</p>
              <span className="text-[10px] text-gray-400">Free: {Math.max(0, 100 - s.proPct - s.premiumPct)}%</span>
            </div>
            <Slider label="Pro" value={s.proPct} min={0} max={100} step={1} unit="%" onChange={(v) => update({ proPct: v })} />
            <Slider label="Premium" value={s.premiumPct} min={0} max={Math.max(0, 100 - s.proPct)} step={1} unit="%" onChange={(v) => update({ premiumPct: v })} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Transações</p>
            <Slider label="Tx/usuário/mês" value={s.txPorUsuario} min={0.1} max={10} step={0.1} onChange={(v) => update({ txPorUsuario: v })} />
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[12px] font-bold text-gray-600">Ticket médio</label>
                <span className="text-[12px] font-black text-gray-900">{formatPrice(s.ticketMedioCents)}</span>
              </div>
              <input type="range" min={3000} max={200000} step={500} value={s.ticketMedioCents}
                onChange={(e) => update({ ticketMedioCents: Number(e.target.value) })}
                className="w-full accent-[var(--color-teal)]" />
            </div>
            <Slider label="Usuários c/ cashback" value={s.cashbackUserPct} min={0} max={100} step={1} unit="%" onChange={(v) => update({ cashbackUserPct: v })} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Custos e horizonte</p>
            <div>
              <label className="text-[12px] font-bold text-gray-600 block mb-1">Custos fixos/mês</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">R$</span>
                <input type="number" min={0} step={100} value={s.custosFixosCents / 100}
                  onChange={(e) => update({ custosFixosCents: Math.max(0, Math.round(Number(e.target.value) * 100)) })}
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)]"
                  placeholder="0" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-600 block mb-1">Horizonte</label>
              <div className="grid grid-cols-4 gap-1">
                {HORIZONTE_OPTIONS.map((h) => (
                  <button key={h} onClick={() => update({ horizonte: h })}
                    className={cn("py-1.5 rounded-lg text-[11px] font-bold transition-colors",
                      s.horizonte === h ? "bg-[var(--color-teal)] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                    {h}a
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <div className="flex gap-2">
              <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Nome do cenário…"
                className="flex-1 px-3 py-2 text-[12px] border border-gray-200 rounded-xl focus:outline-none" />
              <button onClick={handleSave}
                className="px-3 py-2 rounded-xl bg-[var(--color-teal)] text-white text-[12px] font-bold hover:bg-[var(--color-emerald)] transition-colors flex items-center gap-1">
                <Save size={12} /> Salvar
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={cn("rounded-2xl border p-4", isViable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Break-even</p>
              {isViable ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-600" />
                  <p className="text-[18px] font-black text-green-700">Mês {breakEvenIdx + 1}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-[14px] font-black text-red-600">Não atingido</p>
                </div>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">em {s.horizonte} {s.horizonte === 1 ? "ano" : "anos"}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Receita total</p>
              <p className="text-[18px] font-black text-gray-900">{formatShort(totalRevenue)}</p>
              <p className="text-[11px] text-gray-400">{s.horizonte} {s.horizonte === 1 ? "ano" : "anos"}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Despesa total</p>
              <p className="text-[18px] font-black text-gray-900">{formatShort(totalExpense)}</p>
              <p className="text-[11px] text-gray-400">{s.horizonte} {s.horizonte === 1 ? "ano" : "anos"}</p>
            </div>

            <div className={cn("rounded-2xl border p-4", lastPoint.cumProfit >= 0 ? "bg-white border-gray-100" : "bg-red-50 border-red-200")}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Lucro acumulado</p>
              <div className="flex items-center gap-1">
                {lastPoint.cumProfit >= 0 ? <TrendingUp size={14} className="text-green-600 flex-shrink-0" /> : <TrendingDown size={14} className="text-red-500 flex-shrink-0" />}
                <p className={cn("text-[18px] font-black", lastPoint.cumProfit >= 0 ? "text-green-700" : "text-red-600")}>
                  {formatShort(lastPoint.cumProfit)}
                </p>
              </div>
              <p className="text-[11px] text-gray-400">{s.horizonte} {s.horizonte === 1 ? "ano" : "anos"}</p>
            </div>
          </div>

          {/* Lucro acumulado */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[13px] font-black text-gray-800 mb-4">Lucro líquido acumulado</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={displayPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSimCumProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40916C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#40916C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={Math.ceil(displayPoints.length / 12)} />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={62} />
                <Tooltip formatter={(v) => [formatBRL(Number(v ?? 0)), "Lucro acumulado"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <ReferenceLine y={0} stroke="#E11D48" strokeDasharray="4 4" strokeWidth={1.5} />
                {isViable && breakEvenIdx < displayPoints.length && (
                  <ReferenceLine x={displayPoints[breakEvenIdx]?.label} stroke="#40916C" strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "Break-even", position: "insideTopLeft", fontSize: 10, fill: "#40916C" }} />
                )}
                <Area type="monotone" dataKey="cumProfit" stroke="#40916C" strokeWidth={2} fill="url(#gradSimCumProfit)" name="cumProfit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Receita vs Despesa */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[13px] font-black text-gray-800 mb-4">Receita vs Despesa por mês</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={displayPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={Math.ceil(displayPoints.length / 12)} />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={62} />
                <Tooltip
                  formatter={(v, name) => [formatBRL(Number(v ?? 0)), name === "revenue" ? "Comissão" : name === "subscriptionRevenue" ? "Assinaturas" : "Despesas"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend formatter={(v: string) => v === "revenue" ? "Comissão" : v === "subscriptionRevenue" ? "Assinaturas" : "Despesas"} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#40916C" strokeWidth={2} dot={false} name="revenue" />
                <Line type="monotone" dataKey="subscriptionRevenue" stroke="#74C69D" strokeWidth={2} dot={false} name="subscriptionRevenue" />
                <Line type="monotone" dataKey="totalExpense" stroke="#E11D48" strokeWidth={2} dot={false} name="totalExpense" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela por ano */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-[13px] font-black text-gray-800">Resumo anual</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Ano", "Usuários", "Receita", "Despesa", "Lucro Anual", "Lucro Acum."].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yearSummary.map((y) => (
                  <tr key={y.year} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-[13px] font-black text-gray-800">Ano {y.year}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{y.users.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-green-700">{formatShort(y.revenue)}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-red-500">{formatShort(y.expense)}</td>
                    <td className={cn("px-4 py-3 text-[13px] font-bold", y.profit >= 0 ? "text-green-700" : "text-red-500")}>
                      {y.profit >= 0 ? "+" : ""}{formatShort(y.profit)}
                    </td>
                    <td className={cn("px-4 py-3 text-[13px] font-black", y.cumProfit >= 0 ? "text-gray-900" : "text-red-600")}>
                      {formatShort(y.cumProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isViable && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-black text-red-700">Modelo não atinge break-even neste horizonte</p>
                <p className="text-[12px] text-red-600 mt-0.5">
                  Sugestões: aumentar crescimento mensal, elevar ticket médio, reduzir custos fixos, ou ampliar mix de assinantes pagantes (Pro/Premium).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
