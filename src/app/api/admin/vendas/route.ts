import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

function getPeriodDates(period: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const end = new Date(now)
  let days = 30

  if (period === "7d") days = 7
  else if (period === "30d") days = 30
  else if (period === "90d") days = 90
  else if (period === "12m") days = 365

  const start = new Date(now)
  start.setDate(start.getDate() - days)

  const prevEnd = new Date(start)
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - days)

  return { start, end, prevStart, prevEnd }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const period = searchParams.get("period") ?? "30d"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = 20
  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status") ?? ""
  const minCents = searchParams.get("min") ? parseInt(searchParams.get("min")!, 10) : undefined
  const maxCents = searchParams.get("max") ? parseInt(searchParams.get("max")!, 10) : undefined

  const { start, end, prevStart, prevEnd } = getPeriodDates(period)

  const whereBase = {
    createdAt: { gte: start, lte: end },
    ...(status ? { status: status as never } : {}),
    ...(minCents !== undefined ? { amountCents: { gte: minCents } } : {}),
    ...(maxCents !== undefined ? { amountCents: { lte: maxCents } } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" as const } },
            { buyer: { name: { contains: search, mode: "insensitive" as const } } },
            { seller: { name: { contains: search, mode: "insensitive" as const } } },
            { listing: { title: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  }

  const wherePrev = {
    createdAt: { gte: prevStart, lte: prevEnd },
    status: "COMPLETED" as const,
  }

  const [transactions, total, kpis, prevKpis, timeSeries, subscriptionCount, cashbackCosts] =
    await Promise.all([
      db.transaction.findMany({
        where: whereBase,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          amountCents: true,
          commissionCents: true,
          commissionRate: true,
          cashbackUsedCents: true,
          status: true,
          paymentMethod: true,
          buyer: { select: { id: true, name: true } },
          seller: {
            select: {
              id: true,
              name: true,
              subscription: { select: { plan: { select: { slug: true } } } },
            },
          },
          listing: { select: { id: true, title: true } },
        },
      }),
      db.transaction.count({ where: whereBase }),

      db.transaction.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: "COMPLETED" },
        _sum: { amountCents: true, commissionCents: true, cashbackUsedCents: true },
        _count: { id: true },
      }),

      db.transaction.aggregate({
        where: wherePrev,
        _sum: { amountCents: true, commissionCents: true },
        _count: { id: true },
      }),

      db.$queryRaw<{ week: Date; commission: bigint; cashback_cost: bigint; count: bigint }[]>`
        SELECT
          date_trunc('week', t.created_at) as week,
          COALESCE(SUM(t.commission_cents), 0)::bigint as commission,
          COALESCE(SUM(ct.amount_cents), 0)::bigint as cashback_cost,
          COUNT(DISTINCT t.id)::bigint as count
        FROM transactions t
        LEFT JOIN cashback_transactions ct
          ON ct.transaction_id = t.id
          AND ct.type IN ('CREDIT_SELLER', 'CREDIT_BUYER')
        WHERE t.status = 'COMPLETED'
          AND t.created_at >= ${start}
          AND t.created_at <= ${end}
        GROUP BY date_trunc('week', t.created_at)
        ORDER BY week ASC
      `,

      db.userSubscription.count({
        where: {
          status: "ACTIVE",
          plan: { priceCents: { gt: 0 } },
        },
      }),

      db.cashbackTransaction.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          type: { in: ["CREDIT_SELLER", "CREDIT_BUYER"] },
        },
        _sum: { amountCents: true },
      }),
    ])

  const gmv = kpis._sum.amountCents ?? 0
  const commissionRevenue = kpis._sum.commissionCents ?? 0
  const cashbackCost = cashbackCosts._sum.amountCents ?? 0
  const transactionCount = kpis._count.id
  const avgTicket = transactionCount > 0 ? Math.round(gmv / transactionCount) : 0

  const prevGmv = prevKpis._sum.amountCents ?? 0
  const prevCommission = prevKpis._sum.commissionCents ?? 0
  const prevCount = prevKpis._count.id

  function pct(curr: number, prev: number) {
    if (prev === 0) return null
    return Math.round(((curr - prev) / prev) * 1000) / 10
  }

  const kpiData = {
    gmv,
    gmvChange: pct(gmv, prevGmv),
    commissionRevenue,
    commissionChange: pct(commissionRevenue, prevCommission),
    cashbackCost,
    netProfit: commissionRevenue - cashbackCost,
    transactionCount,
    countChange: pct(transactionCount, prevCount),
    avgTicket,
    subscriptionCount,
  }

  const timeSeriesData = (timeSeries as { week: Date; commission: bigint; cashback_cost: bigint; count: bigint }[]).map(
    (row) => ({
      week: row.week.toISOString(),
      commission: Number(row.commission),
      cashbackCost: Number(row.cashback_cost),
      count: Number(row.count),
    })
  )

  return NextResponse.json({
    kpis: kpiData,
    timeSeries: timeSeriesData,
    transactions: transactions.map((t) => ({
      ...t,
      commissionRate: Number(t.commissionRate),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
