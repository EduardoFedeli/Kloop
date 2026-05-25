/**
 * seed-financial.ts
 * Seed financeiro isolado para o dashboard /admin/vendas.
 * Comando: npm run seed:financial
 *
 * Idempotente: remove usuários com email @seed-financial.kloop e tudo associado a eles,
 * depois recria do zero. Não afeta dados de produção ou o seed.ts principal.
 *
 * Mix: ~70% Basic, ~25% Pro, ~5% Premium
 * Status: ~80% COMPLETED, 5% PAID, 5% SHIPPED, 5% CANCELLED, 5% DISPUTED
 * Valores: R$30 a R$800 (moda seminova)
 */

import { PrismaClient, TransactionStatus, PaymentMethod, CashbackTransactionType } from "@prisma/client"

const prisma = new PrismaClient()

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function seededId(prefix: string, n: number): string {
  return `sf-${prefix}-${String(n).padStart(4, "0")}`
}

const LISTING_TITLES = [
  "Jaqueta jeans vintage azul",
  "Tênis Nike Air Force branco 38",
  "Bolsa de couro caramelo pequena",
  "Vestido floral verão M",
  "Calça cargo cinza 40",
  "Blusa oversized preta P",
  "Shorts jeans destroyed G",
  "Sandália rasteira nude 36",
  "Óculos de sol redondo preto",
  "Cinto de couro marrom",
  "Moletom Adidas original M",
  "Camisa xadrez flanela L",
  "Saia midi plissada verde 38",
  "Mochila escolar cinza",
  "Relógio analógico rosê gold",
  "Blazer alfaiataria bege 42",
  "Tênis Vans Old Skool 40",
  "Bolsa crossbody preta",
  "Top cropped branco P",
  "Jeans skinny preto 36",
  "Suéter tricot off-white G",
  "Sneaker chunky branco 39",
  "Vestido midi estampado M",
  "Calça wide leg bege 38",
  "Regata listrada azul e branca",
  "Trench coat clássico bege M",
  "Sapatilha nude 37",
  "Pochete preta média",
  "Cropped tricô rosa P",
  "Bermuda moletom cinza G",
] as const

const METHODS: readonly PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "BOLETO", "PLATFORM_CREDIT"]
const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const

const STATUS_WEIGHTS: Array<{ status: TransactionStatus; weight: number }> = [
  { status: "COMPLETED", weight: 80 },
  { status: "PAID", weight: 5 },
  { status: "SHIPPED", weight: 5 },
  { status: "CANCELLED", weight: 5 },
  { status: "DISPUTED", weight: 5 },
]

function pickStatus(): TransactionStatus {
  const total = STATUS_WEIGHTS.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const { status, weight } of STATUS_WEIGHTS) {
    r -= weight
    if (r <= 0) return status
  }
  return "COMPLETED"
}

type PlanConfig = {
  planId: string
  commissionRate: number
  cashbackSeller: number
  cashbackBuyer: number
}

async function main() {
  console.log("🌱 seed-financial: iniciando...")

  // 1. Garantir planos base
  const [planBasic, planPro, planPremium] = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { slug: "basic" },
      update: { commissionRate: 0.10, features: { cashbackVendas: "3%", cashbackCompras: "2%" } },
      create: {
        name: "Kloop Basic",
        slug: "basic",
        priceCents: 0,
        interval: "MONTHLY",
        maxActiveListings: 20,
        commissionRate: 0.10,
        megaphonesPerWeek: 5,
        features: { cashbackVendas: "3%", cashbackCompras: "2%" },
        isActive: true,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "pro" },
      update: { commissionRate: 0.05, features: { cashbackVendas: "3%", cashbackCompras: "2%" } },
      create: {
        name: "Kloop Pro",
        slug: "pro",
        priceCents: 2990,
        interval: "MONTHLY",
        maxActiveListings: 40,
        commissionRate: 0.05,
        megaphonesPerWeek: 10,
        features: { cashbackVendas: "3%", cashbackCompras: "2%" },
        isActive: true,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "premium" },
      update: { commissionRate: 0.03, features: { cashbackVendas: "3%", cashbackCompras: "2%" } },
      create: {
        name: "Kloop Premium",
        slug: "premium",
        priceCents: 5990,
        interval: "MONTHLY",
        maxActiveListings: 60,
        commissionRate: 0.03,
        megaphonesPerWeek: 25,
        features: { cashbackVendas: "3%", cashbackCompras: "2%" },
        isActive: true,
      },
    }),
  ])

  const planConfigs: PlanConfig[] = [
    { planId: planBasic.id, commissionRate: 0.10, cashbackSeller: 0.03, cashbackBuyer: 0.02 },
    { planId: planPro.id, commissionRate: 0.05, cashbackSeller: 0.03, cashbackBuyer: 0.02 },
    { planId: planPremium.id, commissionRate: 0.03, cashbackSeller: 0.03, cashbackBuyer: 0.02 },
  ]

  console.log("✅ Planos garantidos")

  // 2. Limpar dados anteriores (idempotência)
  const existingUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@seed-financial.kloop" } },
    select: { id: true },
  })
  const existingIds = existingUsers.map((u) => u.id)

  if (existingIds.length > 0) {
    await prisma.cashbackTransaction.deleteMany({ where: { userId: { in: existingIds } } })
    await prisma.review.deleteMany({
      where: {
        transaction: { OR: [{ buyerId: { in: existingIds } }, { sellerId: { in: existingIds } }] },
      },
    })
    await prisma.transaction.deleteMany({
      where: { OR: [{ buyerId: { in: existingIds } }, { sellerId: { in: existingIds } }] },
    })
    await prisma.listing.deleteMany({ where: { sellerId: { in: existingIds } } })
    await prisma.userSubscription.deleteMany({ where: { userId: { in: existingIds } } })
    await prisma.user.deleteMany({ where: { id: { in: existingIds } } })
    console.log(`🗑️  Removeu ${existingIds.length} usuários anteriores e dados associados`)
  }

  // 3. Categoria base
  const category = await prisma.category.upsert({
    where: { slug: "moda-geral" },
    update: {},
    create: { name: "Moda Geral", slug: "moda-geral", sortOrder: 99 },
  })

  // 4. Criar vendedores (30)
  // 0-20 → Basic (21), 21-27 → Pro (7), 28-29 → Premium (2)
  const SELLER_COUNT = 30
  const BUYER_COUNT = 40

  function sellerConfig(i: number): PlanConfig {
    if (i < 21) return planConfigs[0]!
    if (i < 28) return planConfigs[1]!
    return planConfigs[2]!
  }

  console.log("👤 Criando vendedores e compradores...")
  const sellers: Array<{ id: string; cfg: PlanConfig }> = []
  for (let i = 0; i < SELLER_COUNT; i++) {
    const cfg = sellerConfig(i)
    await prisma.user.create({
      data: {
        id: seededId("seller", i),
        name: `Vendedor ${i + 1}`,
        email: `vendedor-${i}@seed-financial.kloop`,
        subscription: {
          create: {
            planId: cfg.planId,
            status: "ACTIVE",
            currentPeriodStart: daysAgo(30),
            currentPeriodEnd: daysAgo(-30),
          },
        },
      },
    })
    sellers.push({ id: seededId("seller", i), cfg })
  }

  const buyerIds: string[] = []
  for (let i = 0; i < BUYER_COUNT; i++) {
    await prisma.user.create({
      data: {
        id: seededId("buyer", i),
        name: `Comprador ${i + 1}`,
        email: `comprador-${i}@seed-financial.kloop`,
      },
    })
    buyerIds.push(seededId("buyer", i))
  }

  // 5. Criar listings
  console.log("📦 Criando listings...")
  const listingPool: Array<{ id: string; sellerId: string; priceCents: number; sellerIdx: number }> = []
  let lIdx = 0
  for (let si = 0; si < sellers.length; si++) {
    const seller = sellers[si]!
    const count = randomInt(1, 3)
    for (let l = 0; l < count; l++) {
      const priceCents = randomInt(3000, 80000)
      const listingId = seededId("listing", lIdx)
      await prisma.listing.create({
        data: {
          id: listingId,
          sellerId: seller.id,
          categoryId: category.id,
          title: pick(LISTING_TITLES),
          slug: `sf-listing-${lIdx}`,
          description: "Peça em ótimo estado, usada poucas vezes. Sem defeitos.",
          priceCents,
          condition: pick(CONDITIONS),
          status: "ACTIVE",
        },
      })
      listingPool.push({ id: listingId, sellerId: seller.id, priceCents, sellerIdx: si })
      lIdx++
    }
  }

  // 6. Criar 210 transações
  console.log("💸 Criando transações...")
  const TRANSACTION_COUNT = 210
  // Primeiras 30 usam cashback
  const CASHBACK_TX_COUNT = 30

  for (let i = 0; i < TRANSACTION_COUNT; i++) {
    const listing = pick(listingPool)
    const seller = sellers[listing.sellerIdx]!
    const cfg = seller.cfg
    // Garantir comprador diferente do vendedor
    const availableBuyers = buyerIds.filter((b) => !b.includes(seller.id))
    const buyerId = pick(availableBuyers)

    const daysBack = randomInt(0, 89)
    const createdAt = daysAgo(daysBack)

    const discount = Math.random() < 0.3 ? randomInt(0, Math.min(1500, listing.priceCents - 3000)) : 0
    const amountCents = Math.max(3000, listing.priceCents - discount)
    const MIN_FEE_CENTS = 150
    const commissionCents = Math.max(MIN_FEE_CENTS, Math.round(amountCents * cfg.commissionRate))

    const usesCashback = i < CASHBACK_TX_COUNT
    const maxCashback = Math.floor(amountCents * 0.1)
    const cashbackUsedCents = usesCashback && maxCashback > 0 ? randomInt(100, Math.min(500, maxCashback)) : 0

    const status = pickStatus()
    const method = pick(METHODS)

    const paidAt =
      ["PAID", "SHIPPED", "DELIVERED", "COMPLETED"].includes(status)
        ? new Date(createdAt.getTime() + 3_600_000 * randomInt(1, 24))
        : null

    const shippedAt =
      ["SHIPPED", "DELIVERED", "COMPLETED"].includes(status) && paidAt
        ? new Date(paidAt.getTime() + 86_400_000 * randomInt(1, 3))
        : null

    const completedAt =
      status === "COMPLETED" && shippedAt
        ? new Date(shippedAt.getTime() + 86_400_000 * randomInt(1, 5))
        : null

    const cancelledAt =
      status === "CANCELLED"
        ? new Date(createdAt.getTime() + 3_600_000 * randomInt(1, 48))
        : null

    const txId = seededId("tx", i)

    await prisma.transaction.create({
      data: {
        id: txId,
        listingId: listing.id,
        buyerId,
        sellerId: seller.id,
        amountCents,
        commissionCents,
        commissionRate: cfg.commissionRate,
        cashbackUsedCents,
        status,
        paymentMethod: method,
        paidAt,
        shippedAt,
        deliveredAt: shippedAt,
        completedAt,
        cancelledAt,
        createdAt,
        updatedAt: completedAt ?? cancelledAt ?? shippedAt ?? paidAt ?? createdAt,
      },
    })

    if (status === "COMPLETED") {
      const sellerCb = Math.round(amountCents * cfg.cashbackSeller)
      const buyerCb = Math.round(amountCents * cfg.cashbackBuyer)
      const expiry = new Date(createdAt.getTime() + 86_400_000 * 180)

      await prisma.cashbackTransaction.createMany({
        data: [
          {
            userId: seller.id,
            type: CashbackTransactionType.CREDIT_SELLER,
            amountCents: sellerCb,
            transactionId: txId,
            description: `Cashback ${(cfg.cashbackSeller * 100).toFixed(0)}% por venda concluída`,
            expiresAt: expiry,
            createdAt,
          },
          {
            userId: buyerId,
            type: CashbackTransactionType.CREDIT_BUYER,
            amountCents: buyerCb,
            transactionId: txId,
            description: `Cashback ${(cfg.cashbackBuyer * 100).toFixed(0)}% por compra concluída`,
            expiresAt: expiry,
            createdAt,
          },
        ],
      })

      if (cashbackUsedCents > 0) {
        await prisma.cashbackTransaction.create({
          data: {
            userId: buyerId,
            type: CashbackTransactionType.DEBIT_PURCHASE,
            amountCents: cashbackUsedCents,
            transactionId: txId,
            description: "Cashback usado no checkout",
            createdAt,
          },
        })
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  → ${i + 1}/${TRANSACTION_COUNT}`)
    }
  }

  // 7. Assinantes extras (sem transações — apenas para contar na métrica de assinantes)
  console.log("⭐ Criando assinantes extras...")
  for (let i = 0; i < 15; i++) {
    await prisma.user.create({
      data: {
        id: seededId("prosub", i),
        name: `Assinante Pro ${i + 1}`,
        email: `pro-sub-${i}@seed-financial.kloop`,
        subscription: {
          create: {
            planId: planPro.id,
            status: "ACTIVE",
            currentPeriodStart: daysAgo(randomInt(1, 90)),
            currentPeriodEnd: daysAgo(-30),
          },
        },
      },
    })
  }
  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        id: seededId("premsub", i),
        name: `Assinante Premium ${i + 1}`,
        email: `prem-sub-${i}@seed-financial.kloop`,
        subscription: {
          create: {
            planId: planPremium.id,
            status: "ACTIVE",
            currentPeriodStart: daysAgo(randomInt(1, 90)),
            currentPeriodEnd: daysAgo(-30),
          },
        },
      },
    })
  }

  console.log(`\n✅ seed-financial concluído!`)
  console.log(`   ${SELLER_COUNT} vendedores (21 Basic / 7 Pro / 2 Premium)`)
  console.log(`   ${BUYER_COUNT} compradores`)
  console.log(`   ${lIdx} listings`)
  console.log(`   ${TRANSACTION_COUNT} transações`)
  console.log(`   20 assinantes extras (15 Pro / 5 Premium)`)
  console.log(`\n   Para re-rodar: npm run seed:financial (idempotente)`)
}

main()
  .catch((e) => {
    console.error("❌ seed-financial falhou:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
