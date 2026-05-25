"use client"

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type TimeSeriesPoint = {
  week: string
  commission: number
  cashbackCost: number
  count: number
}

type CompositionPoint = {
  name: string
  value: number
  color: string
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatWeek(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

interface VendasChartsProps {
  timeSeries: TimeSeriesPoint[]
  subscriptionRevenueCents: number
  totalCommissionCents: number
}

export function VendasCharts({ timeSeries, subscriptionRevenueCents, totalCommissionCents }: VendasChartsProps) {
  const compositionData: CompositionPoint[] = [
    { name: "Comissão C2C", value: totalCommissionCents, color: "#40916C" },
    { name: "Assinaturas", value: subscriptionRevenueCents, color: "#74C69D" },
  ].filter((d) => d.value > 0)

  const hasData = timeSeries.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Entradas vs Saídas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-[13px] font-black text-gray-800 mb-4">Entradas vs Saídas (por semana)</p>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-[13px]">
            Sem dados para o período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeSeries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCommission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#40916C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#40916C" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradCashback" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeek}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `R$${(v / 100).toFixed(0)}`}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatBRL(Number(value ?? 0)),
                  name === "commission" ? "Receita" : "Cashback pago",
                ]}
                labelFormatter={(label) => formatWeek(String(label))}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Area
                type="monotone"
                dataKey="commission"
                stroke="#40916C"
                strokeWidth={2}
                fill="url(#gradCommission)"
                name="commission"
              />
              <Area
                type="monotone"
                dataKey="cashbackCost"
                stroke="#E11D48"
                strokeWidth={2}
                fill="url(#gradCashback)"
                name="cashbackCost"
              />
              <Legend
                formatter={(value: string) => (value === "commission" ? "Receita" : "Cashback pago")}
                wrapperStyle={{ fontSize: 11 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Composição da receita */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-[13px] font-black text-gray-800 mb-4">Composição da receita</p>
        {compositionData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-[13px]">
            Sem receita no período
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {compositionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatBRL(Number(value ?? 0)), ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {compositionData.map((d) => {
                const total = compositionData.reduce((s, x) => s + x.value, 0)
                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
                return (
                  <div key={d.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-[12px] text-gray-600">{d.name}</span>
                    </div>
                    <p className="text-[13px] font-black text-gray-900 ml-4">{formatBRL(d.value)}</p>
                    <p className="text-[11px] text-gray-400 ml-4">{pct}% do total</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
